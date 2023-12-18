import { Message, Type, Field } from "protobufjs/light";

// Data definition for the MQTT message
@Type.d("QueueData")
export class MQTTData extends Message<MQTTData> {
  @Field.d(1, "string", "required")
  public timestamp!: string;
  @Field.d(2, "double", "required")
  public temperature!: number;
  @Field.d(3, "double", "required")
  public humidity!: number;
  @Field.d(4, "string", "optional")
  public identifier?: string;
}