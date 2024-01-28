import { Router } from 'express'
import transactionRoute from './Transaction.routes'
import vendorRoute from './Vendor.routes'
import meterRoute from './Meter.routes'
import powerUnitRoute from './PowerUnit.routes'
import userRoute from './User.routes'
import authRoute from './Auth.routes'
import apikeyRoute from './Apikey.routes'
import profileRoute from './Profile.routes'
import roleRoute from './Role.routes'
import teamMemberRoute from './TeamMember.routes'
import notificationRoute from './Notification.routes'
import eventRoute from './Event.routes'
import webhookRoute from './Webhook.routes'
import partnerRoute from './Partner.routes'
import complainRoute from './complaint.routes'
import productCodeRoute from './ProductCode.routes'

const router = Router()

router
    .use('/transaction', transactionRoute)
    .use('/vendor', vendorRoute)
    .use('/meter', meterRoute)
    .use('/powerunit', powerUnitRoute)
    .use('/user', userRoute)
    .use('/auth', authRoute)
    .use('/key', apikeyRoute)
    .use('/profile', profileRoute)
    .use('/role', roleRoute)
    .use('/team', teamMemberRoute)
    .use('/notification', notificationRoute)
    .use('/event', eventRoute)
    .use('/webhook', webhookRoute)
    .use('/partner', partnerRoute)
    .use('/complaints', complainRoute)
    .use('/productcode', productCodeRoute)

export default router


