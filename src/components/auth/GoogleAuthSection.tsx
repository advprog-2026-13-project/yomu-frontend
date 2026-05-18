"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/src/modules/auth";

interface GoogleAuthSectionProps {
  onError?: () => void;
  errorText?: string;
  text?: "signin_with" | "signup_with";
}

export function GoogleAuthSection({
  onError,
  errorText = "Google Login Failed",
  text,
}: GoogleAuthSectionProps) {
  const { loginWithGoogle, clearError } = useAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    clearError();
    if (!credentialResponse.credential) return;
    await loginWithGoogle(credentialResponse.credential);
  };

  const handleError = () => {
    if (onError) {
      onError();
    } else {
      alert(errorText);
    }
  };

  return (
    <>
      <Separator className="relative">
        <span className="absolute left-1/2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
          atau
        </span>
      </Separator>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={text}
        />
      </div>
    </>
  );
}
