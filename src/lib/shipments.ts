export const SHIPMENT_STAGES = [
  "Shipment Created",
  "Package Received",
  "In Transit",
  "Out for Delivery",
  "Delivered",
] as const;

export function getShipmentStageSequence(stage: string) {
  const index = SHIPMENT_STAGES.findIndex((item) => item === stage);
  return index === -1 ? SHIPMENT_STAGES.length + 1 : index + 1;
}
