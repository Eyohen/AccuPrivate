import express, { Router } from "express";
import VendorRatesController from "../controllers/Admin/VendorRates.controller";
import ProductController from "../controllers/Admin/ProductCode.controller";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";
import RBACMiddleware from "../middlewares/Rbac";
import { RoleEnum } from "../models/Role.model";

const router: Router = express.Router();

// ProductCode-related routes
router
    .post('/', basicAuth('access'), RBACMiddleware.validateRole([RoleEnum.Admin]), AuthenticatedController(ProductController.createProductCode))
    .patch('/', basicAuth('access'), RBACMiddleware.validateRole([RoleEnum.Admin]), AuthenticatedController(ProductController.updateProductCode))
    .get('/', AuthenticatedController(ProductController.getAllProductCodes))
    .get('/info', AuthenticatedController(ProductController.getInfoForProductCode));


// VendorRates-related routes
router
    .post('/vendorrate', basicAuth('access'), RBACMiddleware.validateRole([RoleEnum.Admin]), AuthenticatedController(VendorRatesController.createVendorRate))
    .patch('/vendorrate', basicAuth('access'), RBACMiddleware.validateRole([RoleEnum.Admin]), AuthenticatedController(VendorRatesController.updateVendorRate))
    .get('/vendorrates', AuthenticatedController(VendorRatesController.getAllVendorRates))
    .get('/vendorrates/info', AuthenticatedController(VendorRatesController.getInfoForVendorRate));

export default router;