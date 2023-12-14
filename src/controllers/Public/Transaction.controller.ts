import { Request, Response } from "express";
import Transaction, {
  IQueryTransaction,
  ITransaction,
} from "../../models/Transaction.model";
import TransactionService from "../../services/Transaction.service";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../utils/Errors";
import { Status } from "../../models/Event.model";
import EmailService, { EmailTemplate } from "../../utils/Email";
import { generateRandomToken } from "../../utils/Helper";
import { DISCO_LOGO, NODE_ENV } from "../../utils/Constants";
import PowerUnitService from "../../services/PowerUnit.service";
import ResponseTrimmer from "../../utils/ResponseTrimmer";
import { randomUUID } from "crypto";
import Meter from "../../models/Meter.model";
import VendorService from "../../services/Vendor.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import EventService from "../../services/Event.service";
import { RoleEnum } from "../../models/Role.model";
import TransactionEventService from "../../services/TransactionEvent.service";
import { VendorPublisher } from "../../kafka/modules/publishers/Vendor";
import {Op} from 'sequelize'

interface getTransactionsRequestBody extends ITransaction {
  page: `${number}`;
  limit: `${number}`;
  status: Status;
  startDate: Date;
  endDate: Date;
  userId: string;
  meterId: string;
  disco: string;
  superagent: "BUYPOWERNG" | "BAXI";
}

export default class TransactionController {
  static async getTransactionInfo(req: Request, res: Response) {
    const { bankRefId, transactionId } = req.query as Record<string, string>;

    const transaction: Transaction | null = bankRefId
      ? await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
      : await TransactionService.viewSingleTransaction(transactionId);
    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    const powerUnit = await transaction.$get("powerUnit");

    res.status(200).json({
      status: "success",
      message: "Transaction info retrieved successfully",
      data: { transaction: { ...transaction.dataValues, powerUnit } },
    });
  }

  static async getTransactions(req: AuthenticatedRequest, res: Response) {
    const {
      page,
      limit,
      status,
      startDate,
      endDate,
      userId,
      disco,
      superagent,
      partnerId,
    } = req.query as any as getTransactionsRequestBody;

    console.log(req.query);
    const query = { where: {} } as any;

    if (status) query.where.status = status;
    if (startDate && endDate)
      query.where["transactionTimestamp"] = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    if (userId) query.where.userId = userId;
    if (disco) query.where.disco = disco;
    if (superagent) query.where.superagent = superagent;
    if (limit) query.limit = parseInt(limit);
    if (page && page != "0" && limit) {
      query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit);
    }
    if (partnerId) query.where.partnerId = partnerId;

    const requestWasMadeByAnAdmin = [RoleEnum.Admin].includes(
      req.user.user.entity.role,
    );
    if (!requestWasMadeByAnAdmin) {
      query.where.partnerId = req.user.user.profile.id;
    }

    const transactions: Transaction[] =
      await TransactionService.viewTransactionsWithCustomQuery(query);
    if (!transactions) {
      throw new NotFoundError("Transactions not found");
    }

    res.status(200).json({
      status: "success",
      message: "Transactions retrieved successfully",
      data: { transactions },
    });
  }

  static async requeryTimedOutTransaction(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    const { bankRefId }: { bankRefId: string } = req.query as any;

    let transactionRecord =
      await TransactionService.viewSingleTransactionByBankRefID(bankRefId);
    if (!transactionRecord) {
      throw new NotFoundError("Transaction record not found");
    }

    console.log(transactionRecord.superagent);
    if (transactionRecord.superagent !== "BUYPOWERNG") {
      throw new BadRequestError(
        "Transaction cannot be requery for this superagent",
      );
    }

    let powerUnit = await transactionRecord.$get("powerUnit");
    const response = await VendorService.buyPowerRequeryTransaction({
      transactionId: transactionRecord.id,
    });
    if (response.status === false) {
      const transactionFailed = response.responseCode === 202;
      const transactionIsPending = response.responseCode === 201;

      if (transactionFailed)
        await TransactionService.updateSingleTransaction(transactionRecord.id, {
          status: Status.FAILED,
        });
      else if (transactionIsPending)
        await TransactionService.updateSingleTransaction(transactionRecord.id, {
          status: Status.PENDING,
        });

      res.status(200).json({
        status: "success",
        message: "Requery request successful",
        data: {
          requeryStatusCode: transactionFailed ? 400 : 202,
          requeryStatusMessage: transactionFailed
            ? "Transaction failed"
            : "Transaction pending",
          transaction: ResponseTrimmer.trimTransaction(transactionRecord),
        },
      });

      return;
    }

    const transactionEventService = new TransactionEventService(
      transactionRecord,
      {
        meterNumber: transactionRecord.meter.meterNumber,
        disco: transactionRecord.disco,
        vendType: transactionRecord.meter.vendType,
      },
    );
    await transactionEventService.addTokenReceivedEvent(response.data.token);
    await VendorPublisher.publishEventForReceivedToken({
      meter: {
        id: transactionRecord.meter.id,
        meterNumber: transactionRecord.meter.meterNumber,
        disco: transactionRecord.disco,
        vendType: transactionRecord.meter.vendType,
        token: response.data.token,
      },
      user: {
        name: transactionRecord.user.name as string,
        email: transactionRecord.user.email,
        address: transactionRecord.user.address,
        phoneNumber: transactionRecord.user.phoneNumber,
      },
      partner: {
        email: transactionRecord.partner.email,
      },
      transactionId: transactionRecord.id,
    });

    res.status(200).json({
      status: "success",
      message: "Requery request successful",
      data: {
        requeryStatusCode: 200,
        requeryStatusMessage: "Transaction successful",
        transaction: ResponseTrimmer.trimTransaction(transactionRecord),
      },
    });
  }

  static async getYesterdaysTransactions(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    const { status } = req.query as any as {
      status: "COMPLETED" | "FAILED" | "PENDING";
    };
    const {
      profile: { id },
    } = req.user.user;

    const partner = await PartnerService.viewSinglePartner(id);
    if (!partner) {
      throw new InternalServerError("Authenticated partner not found");
    }

    const transactions = status
      ? await TransactionService.viewTransactionsForYesterdayByStatus(
          partner.id,
          status.toUpperCase() as typeof status,
        )
      : await TransactionService.viewTransactionForYesterday(partner.id);

    const totalAmount = transactions.reduce(
      (acc, curr) => acc + parseInt(curr.amount),
      0,
    );

    res.status(200).json({
      status: "success",
      message: "Transactions retrieved successfully",
      data: { transactions, totalAmount },
    });
  }
}

