/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { Storage } from './storage';
var moment = require('moment');

@Info({title: 'RegistrySmartContract', description: 'Smart contract for registry MBKM'})
export class StorageContract extends Contract {

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, id: string, id_perangkat: string, suhu: string, kelembapan: string, kualitas_udara: string): Promise<any> {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset: Storage = {
            id: id,
            id_perangkat: id_perangkat,
            suhu: suhu,
            kelembapan: kelembapan,
            kualitas_udara: kualitas_udara,
            created_at: moment().format(),
            updated_at: moment().format(),
        };

        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        const idTrx = ctx.stub.getTxID()
        return {"status":"success","idTrx":idTrx,"message":`Pendaftaran Berhasil`}
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    @Transaction()
    async UpdateMitra(ctx: Context, assetID: string, id_mitra: string): Promise<any> {
        const exists = await this.AssetExists(ctx, assetID);
        if (!exists) {
            throw new Error(`Aset dengan ID ${assetID} tidak ditemukan.`);
        }

        const assetBuffer = await ctx.stub.getState(assetID);
        const asset = JSON.parse(assetBuffer.toString());

        asset.mitraId = id_mitra;

        await ctx.stub.putState(assetID, Buffer.from(JSON.stringify(asset)));
        const idTrx = ctx.stub.getTxID();
        return {"status":"success","idTrx":idTrx,"message":`Update Kolom Mitra Berhasil`}
    }

    @Transaction()
    async UpdateStatusLaporan(ctx: Context, assetID: string, newStatus: string): Promise<any> {
        const exists = await this.AssetExists(ctx, assetID);
        if (!exists) {
            throw new Error(`Aset dengan ID ${assetID} tidak ditemukan.`);
        }

        const assetBuffer = await ctx.stub.getState(assetID);
        const asset = JSON.parse(assetBuffer.toString());

        asset.selesai_laporan = newStatus;

        await ctx.stub.putState(assetID, Buffer.from(JSON.stringify(asset)));
        const idTrx = ctx.stub.getTxID();
        return {"status":"success","idTrx":idTrx,"message":`Update Status Laporan Berhasil`}
    }

    @Transaction()
    async UpdateStatusMBKM(ctx: Context, assetID: string, newStatus: string): Promise<any> {
        const exists = await this.AssetExists(ctx, assetID);
        if (!exists) {
            throw new Error(`Aset dengan ID ${assetID} tidak ditemukan.`);
        }

        const assetBuffer = await ctx.stub.getState(assetID);
        const asset = JSON.parse(assetBuffer.toString());

        asset.selesai = newStatus;

        await ctx.stub.putState(assetID, Buffer.from(JSON.stringify(asset)));
        const idTrx = ctx.stub.getTxID();
        return {"status":"success","idTrx":idTrx,"message":`Update Status Pendaftaran & File IPFS Berhasil`}
    }

    @Transaction()
    async UpdateStatus(ctx: Context, assetID: string, newStatus: string, file: string): Promise<any> {
        const exists = await this.AssetExists(ctx, assetID);
        if (!exists) {
            throw new Error(`Aset dengan ID ${assetID} tidak ditemukan.`);
        }

        const assetBuffer = await ctx.stub.getState(assetID);
        const asset = JSON.parse(assetBuffer.toString());

        asset.persetujuan = newStatus;
        asset.file = file;
        asset.updated_at = moment().format();

        await ctx.stub.putState(assetID, Buffer.from(JSON.stringify(asset)));
        const idTrx = ctx.stub.getTxID();
        return {"status":"success","idTrx":idTrx,"message":`Update Status Pendaftaran & File IPFS Berhasil`}
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, id: string, id_perangkat: string, suhu: string, kelembapan: string, kualitas_udara: string, created_at: string): Promise<any> {

      const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset: Storage = {
            id: id,
            id_perangkat: id_perangkat,
            suhu: suhu,
            kelembapan: kelembapan,
            kualitas_udara: kualitas_udara,
            created_at: created_at,
            updated_at: moment().format(),
        };

        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
        const idTrx = ctx.stub.getTxID();
        return {"status":"success","idTrx":idTrx,"message":`Update Pendaftaran Berhasil`}
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}
