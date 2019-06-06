import { TxType } from "app/eth-extended/data/tx/TxType";
import { ITxLiteByAccountBase } from "app/eth-extended/data/tx/lite/byAccount/ITxLiteByAccountBase";
import { BigNumber } from "app/util/BigNumber";

export interface ITxLiteByAccountMined extends ITxLiteByAccountBase {
    gasUsed: BigNumber;
    type: TxType;
    block: {
        id: number;
        creationTime: number;
    };
    error: string | undefined;
    blockMsgValidationIndex: number;
}
