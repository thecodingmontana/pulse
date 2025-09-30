import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { formSchema } from "~/types/forms";
import OauthProviders from "../oauth/oauth-providers";

export default function SignupForm() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsAuthenticating(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="peer ps-9 placeholder:text-zinc-950/40 dark:placeholder:text-white/30"
                          placeholder="name@email.com"
                          type="email"
                          {...field}
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <Mail aria-hidden="true" size={16} />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="peer ps-9 placeholder:text-zinc-950/40 dark:placeholder:text-white/30"
                          placeholder="secretKey"
                          type="password"
                          {...field}
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <Lock aria-hidden="true" size={16} />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
          </div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button className="w-full bg-brand text-white hover:bg-brand-secondary">
              Create an account
            </Button>
          </motion.div>
        </form>
      </Form>
      <motion.div
        animate={{ opacity: 1 }}
        className="inline-flex h-3 items-center justify-center gap-2.5"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="h-px grow bg-zinc-950/10 dark:bg-white/10" />
        <div className="text-center text-sm text-zinc-950/50 dark:text-white/30">OR</div>
        <div className="h-px grow bg-zinc-950/10 dark:bg-white/10" />
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <OauthProviders isAuthenticating={isAuthenticating} />
      </motion.div>
    </div>
  );
}
