import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signin } from "@/features/auth/api";
import { setCredentials } from "@/features/auth/authSlice";
import {
    Card, CardHeader, CardTitle, CardContent, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner"
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from "@/components/ui/form";

const schema = z.object({
    email: z.email(),
    password: z.string(),
});
type FormValues = z.infer<typeof schema>;

export default function SignIn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: signin,
        onSuccess: (data) => {
            dispatch(setCredentials({ token: data.token, expiresAt: data.expiresAt }));
            const to = location?.state?.from?.pathname ?? "/dashboard";
            navigate(to, { replace: true });
        },
    });

    const onSubmit = (values: FormValues) => mutate(values);

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input type="email" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && (
                                <p className="text-sm text-red-600">Authentication failed.</p>
                            )}
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Spinner />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-between text-sm">
                    <span />
                    <Link to="/signup" className="underline">
                        Create an account
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
