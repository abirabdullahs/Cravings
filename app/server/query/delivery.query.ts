/*
ACCEPT DELIVERY
{
orderId, userid, 
}
*/
const Assign_delivery = `UPDATE deliveries SET status = 'ASSIGNED' WHERE id = $1 AND status = 'UNASSIGNED' RETURNING *;`
