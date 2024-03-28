import MockEndpointData from "../models/MockAPI.model";
import { IMockEndpointData } from "../models/MockAPI.model";

interface getAllMockDataVendorEndpointWhereClause {
    endpoint?: string;
    vendor?: string;
  }

export default class MockApiService {

    static async getMockData(where: any): Promise<MockEndpointData | void>{
        try{
            const data : MockEndpointData | null = await MockEndpointData.findOne({
                where
            })
            if(data === null) throw Error('No item  found')
            return data 
            
        }catch(err){
            throw err
        }
        
    }

    static async getAllMockDataVendorEndpoint (vendor: string | null , endpoint: string | null){
        try{
            const whereClause : getAllMockDataVendorEndpointWhereClause  = {}
            if(endpoint) whereClause.endpoint = endpoint
            if(vendor) whereClause.vendor = vendor

            const data: MockEndpointData[]  = await MockEndpointData.findAll({
                where: { ...whereClause}
            })

            if(data === null) throw Error('No items  found')
            return data 

        }catch(err){
            throw err
        }
    }

    static async setMockEndpointActive(id: string){
        
    }

    static async updateMockData (){

    }
    static mapDataToResponse(mockdata : MockEndpointData) : any{
        
    }
}