import { supabase } from "@/lib/supabase";

type DeleteAccountResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export const deleteAccount = async () => {
  const { data, error } = await supabase.functions.invoke<DeleteAccountResponse>(
    "delete-account",
    { body: {} },
  );

  if (error) {
    throw new Error(error.message || "Account deletion failed.");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Account deletion failed.");
  }

  return data;
};
