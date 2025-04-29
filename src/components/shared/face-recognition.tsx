"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Camera, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateStudentDescription } from '@/ai/flows/generate-student-descriptions'; // Assuming Genkit flow path
import { markAttendance, getTodayDateString } from '@/lib/attendance'; // Import attendance marking function

// Mock student data (replace with actual data fetching based on recognition)
const mockStudents = [
    { id: 'student1', name: 'Alice Smith' },
    { id: 'student2', name: 'Bob Johnson' },
    // Add more mock students as needed
];


interface FaceRecognitionProps {
    onAttendanceMarked?: (studentId: string, studentName: string) => void; // Callback when marked
}


export function FaceRecognition({ onAttendanceMarked }: FaceRecognitionProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [identifiedStudent, setIdentifiedStudent] = useState<{ id: string; name: string } | null>(null);
    const [status, setStatus] = useState<'idle' | 'capturing' | 'processing' | 'success' | 'error' | 'marked'>('idle');
    const { toast } = useToast();

    const capture = useCallback(() => {
        if (webcamRef.current) {
            setStatus('capturing');
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
            setStatus('processing');
            handleRecognition(imageSrc);
        } else {
             toast({ title: "Webcam Error", description: "Webcam not available.", variant: "destructive" });
             setStatus('error');
        }
    }, [webcamRef, toast]); // Added toast to dependencies

    const handleRecognition = async (imageDataUri: string | null) => {
        if (!imageDataUri) {
            setStatus('error');
            toast({ title: "Capture Error", description: "No image captured.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setIdentifiedStudent(null); // Reset previous identification

        try {
            // **1. Call Genkit AI Flow (Simplified)**
            // Replace with actual Genkit flow call. For demo, we simulate recognition.
            console.log("Sending to AI for recognition (simulated)...");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time

            // ** SIMULATED RECOGNITION **
            // In a real app, the AI flow would return the identified student ID/name.
            // Here, we randomly pick a student or simulate failure.
            const recognized = Math.random() > 0.3; // 70% chance of recognition
            let student = null;
            if (recognized) {
                student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
                setIdentifiedStudent(student);
                 toast({ title: "Recognition Result", description: `Identified: ${student.name}` });
                console.log(`Simulated Recognition: ${student.name} (${student.id})`);

                // **2. Mark Attendance**
                 try {
                    const today = getTodayDateString();
                    // Mark as present for simplicity. Could add logic for lateness.
                    await markAttendance(student.id, today, 'present');
                     setStatus('marked');
                     toast({ title: "Attendance Marked", description: `${student.name} marked as present for ${today}.`, variant: "default" });
                     onAttendanceMarked?.(student.id, student.name); // Trigger callback

                 } catch (attendanceError: any) {
                     console.error("Failed to mark attendance:", attendanceError);
                     setStatus('error');
                     toast({ title: "Attendance Error", description: `Could not mark attendance for ${student.name}.`, variant: "destructive" });
                 }

            } else {
                 setStatus('error');
                 toast({ title: "Recognition Failed", description: "Could not identify student from the image.", variant: "destructive" });
                 console.log("Simulated Recognition: Failed");
            }


             // Example using the actual Genkit flow (if it were fully set up)
             /*
             const result = await generateStudentDescription({
                 photoDataUri: imageDataUri,
                 studentName: 'Unknown', // Genkit might identify name or need other input
                 additionalDetails: 'Attendance check',
             });
             // Process result - this flow generates descriptions, not IDs.
             // You'd need a different flow specifically for identification returning an ID.
             console.log("AI Description:", result.description);
             // ---> Need logic here to map description/features back to a student ID <---
             // This is the complex part requiring a dedicated identification model/flow.
             */


        } catch (error: any) {
            console.error("Recognition Error:", error);
            setStatus('error');
            toast({ title: "Recognition Error", description: error.message || "An error occurred during face recognition.", variant: "destructive" });
        } finally {
            setIsLoading(false);
             if (status !== 'marked') { // Only reset image if not successfully marked
                // Optionally clear image after processing failure/error
                 // setImgSrc(null);
             }
        }
    };

     const reset = () => {
        setImgSrc(null);
        setIdentifiedStudent(null);
        setStatus('idle');
        setIsLoading(false);
    }

     // Clean up camera stream on unmount
    useEffect(() => {
        return () => {
            // Logic to stop webcam stream if necessary (react-webcam might handle this)
             if (webcamRef.current?.stream) {
                 webcamRef.current.stream.getTracks().forEach(track => track.stop());
             }
        };
    }, []);


    return (
        <Card className="w-full max-w-md mx-auto">
             <CardHeader>
                <CardTitle className="text-center">Mark Attendance</CardTitle>
                <CardDescription className="text-center">Position your face in the frame and capture.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
                 <div className="w-full aspect-square bg-secondary rounded-md overflow-hidden border relative">
                     {status === 'marked' || status === 'success' || status === 'error' || imgSrc ? (
                        <>
                            {imgSrc && <img src={imgSrc} alt="Captured face" className="object-cover w-full h-full" />}
                             {/* Status Overlay */}
                             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                {isLoading ? (
                                     <Loader2 className="h-16 w-16 text-white animate-spin" />
                                ) : status === 'marked' ? (
                                    <div className="text-center text-white">
                                        <UserCheck className="h-16 w-16 mx-auto text-green-400" />
                                        <p className="mt-2 font-semibold">Attendance Marked!</p>
                                        <p>{identifiedStudent?.name}</p>
                                    </div>
                                ) : status === 'error' ? (
                                    <div className="text-center text-white">
                                        <XCircle className="h-16 w-16 mx-auto text-red-400" />
                                        <p className="mt-2 font-semibold">Recognition Failed</p>
                                    </div>
                                ) : null }
                            </div>
                        </>
                     ) : (
                         <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="object-cover w-full h-full"
                            videoConstraints={{ facingMode: "user" }}
                         />
                     )}
                </div>

            </CardContent>
             <CardFooter className="flex flex-col space-y-2">
                 {status !== 'marked' && (
                     <Button onClick={capture} disabled={isLoading || status === 'processing'} className="w-full bg-accent hover:bg-accent/90">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Processing...' : 'Capture & Mark Attendance'}
                    </Button>
                 )}
                 {(status === 'error' || status === 'marked' || imgSrc) && (
                     <Button onClick={reset} variant="outline" className="w-full">
                        Reset / Try Again
                    </Button>
                 )}
            </CardFooter>
        </Card>
    );
}
