import { useState } from "react";
import Uploader from "./Uploader";
import AnalysisPage from "./AnalysisPage";

export default function AnalyzeComp({taskId, setTaskId}){
   
    const [loading,setLoading] = useState();

    return taskId ? <AnalysisPage taskId={taskId} /> : <Uploader updateTaskId={(jobId)=>{setTaskId(jobId)}}/>
}