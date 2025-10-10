import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "@/features/auth/api";
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
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

export default function SignUp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", username: "", password: "" },
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: signup,
        onSuccess: (data) => {
            dispatch(setCredentials({ token: data.token, expiresAt: data.expiresAt }));
            navigate("/dashboard", { replace: true });
        },
    });

    const onSubmit = (values: FormValues) => mutate(values);

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create account</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField name="email" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="username" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="password" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            {error && <p className="text-sm text-red-600">Sign up failed.</p>}
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Spinner />
                                        Creating...
                                    </>
                                ) : (
                                    "Create account"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-between text-sm">
                    <span />
                    <Link to="/signin" className="underline">Already have an account?</Link>
                </CardFooter>
            </Card>
        </div>
    );
}
