"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Mail } from 'lucide-react'; // Import icons

export default function StudentProfilePage() {
  const { user } = useAuth();

  // Placeholder function for getting initials
   const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Placeholder for handling profile updates
  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    // Add update logic here - e.g., call an API endpoint
    alert("Profile update functionality not yet implemented.");
  };

   // Placeholder for handling face data upload/update
   const handleFaceDataUpdate = () => {
     alert("Face data update functionality requires camera integration and is not yet implemented.");
     // This would involve:
     // 1. Accessing the camera (navigator.mediaDevices.getUserMedia)
     // 2. Capturing an image/video frame
     // 3. Optionally sending it to the backend for processing/storage
     // 4. Storing the face data URI or reference associated with the user
   };


  if (!user) {
    return <div>Loading profile...</div>; // Or a proper loading state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>View and update your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {/* Display user's profile picture or fallback */}
                <AvatarImage src={`https://picsum.photos/seed/${user.id}/80/80`} alt={user.name} />
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleFaceDataUpdate}>
                 <Camera className="mr-2 h-4 w-4" /> Update Face Data
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
               Updating your face data helps ensure accurate attendance marking via facial recognition.
            </p>
           <form onSubmit={handleUpdate} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="name">
                  <User className="inline-block mr-2 h-4 w-4 align-text-bottom" />
                  Full Name
               </Label>
               <Input id="name" defaultValue={user.name} />
             </div>
             <div className="space-y-2">
               <Label htmlFor="email">
                 <Mail className="inline-block mr-2 h-4 w-4 align-text-bottom" />
                 Email Address
               </Label>
               <Input id="email" type="email" defaultValue={user.email} disabled />
               {/* Typically email is not editable after signup */}
             </div>
             {/* Add fields for password change if needed */}
             <Button type="submit" className="bg-accent hover:bg-accent/90">Save Changes</Button>
           </form>

        </CardContent>

      </Card>
    </div>
  );
}
