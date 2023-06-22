"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

export const runtime = "edge";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(32, "El nombre debe tener menos de 32 caracteres"),
  room: z
    .string()
    .min(5, "El nombre de la sala debe tener al menos 5 caracteres")
    .max(32, "El nombre de la sala debe tener menos de 32 caracteres"),
});

export default function Home() {
  const router = useRouter();
  const name =
    typeof window !== "undefined" ? localStorage.getItem("name") : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name ?? "",
      room: "",
    },
  });

  const normalizeRoomName = (value: string) => {
    return value.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, room } = values;
    const normalizedRoomName = normalizeRoomName(room);

    localStorage.setItem("name", name);
    router.push(`/room/${normalizedRoomName}`);
  };

  return (
    <main className="grid h-screen w-screen  place-content-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="min-w-[350px]">
            <CardHeader>
              <CardTitle>Yo nunca</CardTitle>
              <CardDescription>El juego de beber</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-4 grid gap-2">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del juego" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Sala</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre o ID de la sala" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button className="w-full">Entrar</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </main>
  );
}
