import { cn } from "@/lib/utils";

export const Error = ({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) => {
  return (
    <small
      className={cn(
        "text-sm font-medium leading-none text-destructive",
        className
      )}
    >
      {message}
    </small>
  );
};
