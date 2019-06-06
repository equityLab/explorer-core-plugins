import { IModuleDef } from "plugin-api/IModuleDef";
import { ISummaryProps } from "./component/Summary";
import { IAccountContext } from "app/shared/context/IAccountContext";
import { IAccountDetails } from "app/eth-extended/data/account/details/IAccountDetails";
import { AlethioDataSource } from "app/eth-extended/AlethioDataSource";
import { LatestBlockWatcher } from "app/shared/adapter/block/LatestBlockWatcher";
import { EventWatcher } from "plugin-api/watcher/EventWatcher";
import { ITxCounts } from "./ITxCounts";
import { accountContextType } from "app/shared/context/accountContextType";
import { AlethioAdapterType } from "app/shared/adapter/AlethioAdapterType";

export const accountSummaryModule: (dataSource: AlethioDataSource) => IModuleDef<ISummaryProps, IAccountContext> =
(dataSource) => ({
    contextType: accountContextType,

    dataAdapters: [{
        ref: AlethioAdapterType.AccountDetailsExtended
    }, {
        alias: "pendingTxsCount",
        def: {
            contextType: accountContextType,
            async load(context) {
                let { blockStateStore, txPendingCountsByAccountStore } = dataSource.stores;
                let latestBlockNo = blockStateStore.getLatest();
                let counts = await txPendingCountsByAccountStore.fetch(context.accountHash, latestBlockNo);
                return counts.inbound + counts.outbound;
            },
            createWatcher(context) {
                return [
                    new LatestBlockWatcher(dataSource.stores.blockStateStore, 60 * 5),
                    new EventWatcher(
                        dataSource.stores.txLiteByAccountStore.onFetchPending,
                        data => data.replace(/^0x/, "") === context.accountHash
                    )
                ];
            }
        },
        optional: true
    }],
    getContentComponent: async () => import("./component/Summary").then(({ Summary }) => Summary),
    getContentProps(data) {
        let { locale, translation, logger, asyncData } = data;

        let accountDetails = asyncData.get(AlethioAdapterType.AccountDetailsExtended)!.data as IAccountDetails;
        let pendingTxsCounts = asyncData.get("pendingTxsCount")!.data as number | undefined;
        let { cmLiteStore, txLiteByAccountStore } = dataSource.stores;
        let txCounts: ITxCounts = {
            in: accountDetails.countTxIn,
            out: accountDetails.countTxOut,
            pending: pendingTxsCounts || 0
        };

        let props: ISummaryProps = {
            accountDetails,
            cmLiteByAccountStore: cmLiteStore.getByAccountStore(),
            locale,
            logger,
            translation,
            txCounts,
            txLiteByAccountStore
        };
        return props;
    }
});
