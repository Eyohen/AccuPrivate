import { Router } from 'express'
import transactionRoute from './Public/Transaction.route'
import vendorRoute from './Public/Vendor.routes'
const router = Router()

router
    .use('/transaction', transactionRoute)
    .use('/vendor', vendorRoute)

export default router


