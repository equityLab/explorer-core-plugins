import { FifoCache } from "app/util/cache/FifoCache";
import { HttpRequest } from "@puzzl/browser/lib/network/HttpRequest";
import { HttpApi } from "app/eth-extended/data/HttpApi";
import { CmDetailsStore } from "app/eth-extended/data/contractMsg/details/CmDetailsStore";
import { ICmDetails } from "app/eth-extended/data/contractMsg/details/ICmDetails";
import { CmDetailsApi } from "app/eth-extended/data/contractMsg/details/CmDetailsApi";
import { CmDetailsReader } from "app/eth-extended/data/contractMsg/details/CmDetailsReader";
import { Decoder } from "app/eth-extended/data/payload/Decoder";
import { ILogger } from "plugin-api/ILogger";
import { AlethioDataSourceConfig } from "app/eth-extended/AlethioDataSourceConfig";

const CACHE_SIZE = 100;

export class CmDetailsStoreFactory {
    constructor(private appConfig: AlethioDataSourceConfig, private logger: ILogger) {

    }

    create() {
        return new CmDetailsStore(
            new FifoCache<string, ICmDetails>(CACHE_SIZE),
            new CmDetailsApi(
                new HttpApi(new HttpRequest()),
                new CmDetailsReader(new Decoder(this.logger)),
                this.appConfig.getContractMsgApiUrlMask()
            )
        );
    }
}
