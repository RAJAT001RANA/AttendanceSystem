
"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Camera, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateStudentDescription } from '@/ai/flows/generate-student-descriptions'; // Assuming Genkit flow path
import { markAttendance, getTodayDateString } from '@/lib/attendance'; // Import attendance marking function
import { getMockUsers, getUserById } from '@/lib/auth'; // Import function to get mock users

// Mock student data (replace with actual data fetching based on recognition)
// Fetch mock users to simulate database
let mockStudents: { id: string; name: string }[] = [];
getMockUsers().then(users => {
    mockStudents = users.filter(u => u.role === 'student').map(u => ({ id: u.id, name: u.name }));
});


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
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

     // Get camera permission on mount
    useEffect(() => {
        const getCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
            // Assign the stream to the video ref (handled by react-webcam)
            if (webcamRef.current && webcamRef.current.video) {
                 // react-webcam handles stream assignment internally via props
                 // No need to set srcObject manually if using react-webcam component
            }
             // Clean up stream on component unmount
            return () => {
                stream.getTracks().forEach(track => track.stop());
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
            setStatus('error'); // Set error status if camera access fails
        }
        };

        getCameraPermission();
    }, [toast]); // Dependency on toast


    const capture = useCallback(() => {
        if (!hasCameraPermission) {
             toast({ title: "Camera Error", description: "Camera permission is required.", variant: "destructive" });
             setStatus('error');
             return;
        }
        if (webcamRef.current) {
            setStatus('capturing');
            const imageSrc = webcamRef.current.getScreenshot();
             if (!imageSrc) {
                toast({ title: "Capture Failed", description: "Could not capture image from webcam.", variant: "destructive" });
                setStatus('error');
                return;
            }
            setImgSrc(imageSrc);
            setStatus('processing');
            handleRecognition(imageSrc);
        } else {
             toast({ title: "Webcam Error", description: "Webcam not available or ready.", variant: "destructive" });
             setStatus('error');
        }
    }, [webcamRef, toast, hasCameraPermission]); // Added hasCameraPermission


    const handleRecognition = async (imageDataUri: string | null) => {
        if (!imageDataUri) {
            setStatus('error');
            toast({ title: "Capture Error", description: "No image captured.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setIdentifiedStudent(null); // Reset previous identification

        try {
            // **1. Call Genkit AI Flow (Simplified/Simulated)**
            // Ideally, the AI flow would take the image and return the student ID.
            // For now, we simulate by calling the description flow and then 'recognizing'.
            console.log("Sending to AI for recognition (simulated step)...");

            // Simulate a call to a *potential* future identification flow or use description as a hint
             let studentNameHint = 'Unknown';
             try {
                 // Use the existing description flow as a *placeholder*
                 const descriptionResult = await generateStudentDescription({
                     photoDataUri: imageDataUri,
                     studentName: '?', // Pass placeholder
                     additionalDetails: 'Attendance Check',
                 });
                 console.log("AI Description (for hint):", descriptionResult.description);
                 // In a real scenario, you might extract keywords or use a dedicated ID flow.
                 // Here, we'll just keep it simple for the simulation.

             } catch (aiError) {
                 console.warn("AI description flow failed (used as hint), continuing simulation:", aiError);
             }


            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time

            // ** SIMULATED RECOGNITION LOGIC **
            // Randomly pick a student from the loaded mock list.
            const recognized = Math.random() > 0.2; // 80% chance of recognition
            let student: { id: string; name: string } | null = null;

            if (recognized && mockStudents.length > 0) {
                student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
                // Fetch full details just to be sure name is up-to-date (though mock is static here)
                const fullStudent = await getUserById(student.id);
                if(fullStudent) {
                    student = { id: fullStudent.id, name: fullStudent.name }; // Use potentially updated name
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
                         toast({ title: "Attendance Error", description: `Could not mark attendance for ${student?.name || 'identified student'}. ${attendanceError.message}`, variant: "destructive" });
                     }
                } else {
                     // Should not happen with mock data, but good practice
                     setStatus('error');
                     toast({ title: "Recognition Error", description: "Identified student not found in database.", variant: "destructive" });
                     console.log("Simulated Recognition: Failed - Student ID not found");
                }

            } else {
                 setStatus('error');
                 toast({ title: "Recognition Failed", description: "Could not identify student from the image.", variant: "destructive" });
                 console.log("Simulated Recognition: Failed");
            }


        } catch (error: any) {
            console.error("Recognition or Marking Error:", error);
            setStatus('error');
            toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
             // Don't reset image immediately on error to show the captured face
        }
    };

     const reset = () => {
        setImgSrc(null);
        setIdentifiedStudent(null);
        setStatus('idle');
        setIsLoading(false);
    }


    return (
        <Card className="w-full max-w-md mx-auto">
             <CardHeader>
                <CardTitle className="text-center">Mark Attendance</CardTitle>
                <CardDescription className="text-center">Position student's face in the frame and capture.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
                 <div className="w-full aspect-square bg-secondary rounded-md overflow-hidden border relative">
                     {/* Show Webcam or Captured Image/Status */}
                      {hasCameraPermission === false && status !== 'marked' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-center p-4">
                             <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="font-semibold text-destructive">Camera Access Required</p>
                            <p className="text-sm text-muted-foreground">Please allow camera access in your browser settings to use this feature.</p>
                         </div>
                     )}

                     {hasCameraPermission === null && status !== 'marked' && (
                         <div className="absolute inset-0 flex items-center justify-center bg-muted">
                             <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                         </div>
                     )}

                      {(status === 'marked' || status === 'success' || status === 'error' || imgSrc) && hasCameraPermission !== false ? (
                        <>
                            {imgSrc && <img src={imgSrc} alt="Captured face" className="object-cover w-full h-full" data-ai-hint="person face"/>}
                             {/* Status Overlay */}
                             <div className={`absolute inset-0 flex items-center justify-center ${imgSrc ? 'bg-black/50' : 'bg-background'}`}>
                                {isLoading ? (
                                     <Loader2 className="h-16 w-16 text-white animate-spin" />
                                ) : status === 'marked' ? (
                                    <div className="text-center text-white p-4">
                                        <UserCheck className="h-16 w-16 mx-auto text-green-400" />
                                        <p className="mt-2 font-semibold">Attendance Marked!</p>
                                        {identifiedStudent && <p>{identifiedStudent.name}</p>}
                                    </div>
                                ) : status === 'error' ? (
                                    <div className="text-center text-white p-4">
                                        <XCircle className="h-16 w-16 mx-auto text-red-400" />
                                        <p className="mt-2 font-semibold">Recognition Failed</p>
                                         {/* Optionally show more details */}
                                    </div>
                                ) : status === 'success' ? ( // Generic success if needed
                                     <div className="text-center text-white p-4">
                                        <CheckCircle className="h-16 w-16 mx-auto text-blue-400" />
                                        <p className="mt-2 font-semibold">Processing Complete</p>
                                    </div>
                                ) : null }
                            </div>
                        </>
                     ) : (
                         hasCameraPermission && ( // Only render Webcam if permission granted
                             <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="object-cover w-full h-full"
                                videoConstraints={{ facingMode: "user", width: 300, height: 300 }} // Set dimensions
                                mirrored={true} // Usually preferred for user-facing camera
                            />
                         )
                     )}
                </div>

            </CardContent>
             <CardFooter className="flex flex-col space-y-2">
                  {status !== 'marked' && (
                     <Button
                         onClick={capture}
                         disabled={isLoading || status === 'processing' || hasCameraPermission === false || hasCameraPermission === null}
                         className="w-full bg-accent hover:bg-accent/90"
                     >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Processing...' : status === 'error' ? 'Capture Again' : 'Capture & Mark Attendance'}
                    </Button>
                 )}
                 {(status === 'error' || status === 'marked' || imgSrc) && (
                     <Button onClick={reset} variant="outline" className="w-full">
                        {status === 'marked' ? 'Mark Another' : 'Reset / Try Again'}
                    </Button>
                 )}
            </CardFooter>
        </Card>
    );
}
