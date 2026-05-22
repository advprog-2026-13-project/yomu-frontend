"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthCardProps {
  title: string;
  description: string;
  error?: string | null;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  extras?: React.ReactNode;
}

export function AuthCard({
  title,
  description,
  error,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  extras,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {children}
          {extras}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {footerText}{" "}
            <Link href={footerLinkHref} className="text-primary underline-offset-4 hover:underline">
              {footerLinkText}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
