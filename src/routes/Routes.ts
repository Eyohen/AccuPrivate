import { Router } from 'express'
import transactionRoute from './Public/Transaction.route'
import vendorRoute from './Public/Vendor.routes'
import meterRoute from './Public/Meter.route'

const router = Router()

router
    .use('/transaction', transactionRoute)
    .use('/vendor', vendorRoute)
    .use('/meter', meterRoute)

export default router


