import { useState } from "react";
import Uploader from "./Uploader";
import AnalysisPage from "./AnalysisPage";
import { useSearchParams } from "next/navigation";

export default function AnalyzeComp(){

    const urlParams = useSearchParams();
    const [taskId,setTaskId] = useState(urlParams.get('taskId'));
   
    const [loading,setLoading] = useState();

    return taskId ? <AnalysisPage taskId={taskId} /> : <Uploader updateTaskId={(jobId)=>{setTaskId(jobId)}}/>
}