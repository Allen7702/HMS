import * as usersSchema from './users';
import * as roomsSchema from './rooms';
import * as guestsSchema from './guests';
import * as roomTypesSchema from './roomTypes';
import * as bookingsSchema from './bookings';
import * as maintenancesSchema from './maintenances';
import * as invoicesSchema from './invoices';
import * as auditLogsSchema from './auditLogs';
import * as notificationsSchema from './notifications';
import * as housekeepingsSchema from './housekeepings';
import * as otaReservationsSchema from './otaReservations';
import * as paymentsSchema from './payments';

export const schema = {
    ...usersSchema,
    ...roomsSchema,
    ...guestsSchema,
    ...roomTypesSchema,
    ...bookingsSchema,
    ...maintenancesSchema,
    ...invoicesSchema,
    ...auditLogsSchema,
    ...notificationsSchema,
    ...housekeepingsSchema,
    ...otaReservationsSchema,
    ...paymentsSchema,
};