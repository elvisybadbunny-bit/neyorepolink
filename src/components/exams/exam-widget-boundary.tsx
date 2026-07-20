"use client";
import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
export class ExamWidgetBoundary extends React.Component<{name:string;children:React.ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return{failed:true};}
  componentDidCatch(error:unknown){console.error(`Optional Exams widget failed: ${this.props.name}`,error);}
  render(){if(this.state.failed)return <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>{this.props.name} is temporarily unavailable. The main Exams workspace is still safe to use.</span><Button size="sm" variant="secondary" onClick={()=>this.setState({failed:false})}>Retry section</Button></div>;return this.props.children;}
}
