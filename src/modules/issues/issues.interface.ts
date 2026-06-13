export interface IIssues{
    title:string;
    description:string;
    type:'bug' | 'feature_request';
    status:'bug' | 'feature_request';
    reporter_id:number

}