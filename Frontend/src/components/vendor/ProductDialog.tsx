import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import {
    createProduct,
    updateProduct,
    getVendorProduct,
    VendorProduct,
} from "@/lib/vendorApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Eye, Loader2, Plus, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const productSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    description: z.string().optional(),
    category: z.string().min(1, "Please select a category"),
    pricePerDay: z.coerce.number().min(1, "Daily price must be at least 1"),
    pricePerHour: z.coerce.number().optional().or(z.literal("")),
    pricePerWeek: z.coerce.number().optional().or(z.literal("")),
    pricePerMonth: z.coerce.number().optional().or(z.literal("")),
    totalQty: z.coerce.number().min(1, "Quantity must be at least 1"),
    isPublished: z.boolean().default(false),
    image: z.any().optional(), // Modified to allow string URL for edits or FileList for new upgrades
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
    mode?: "add" | "edit" | "view";
    product?: VendorProduct; // Pass full product object for edit/view
    productId?: string; // Or pass ID to fetch details
    onProductSaved?: () => void;
    trigger?: React.ReactNode;
}

export function ProductDialog({
    mode = "add",
    product: initialProduct,
    productId,
    onProductSaved,
    trigger,
}: ProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [productData, setProductData] = useState<VendorProduct | undefined>(
        initialProduct
    );

    const isView = mode === "view";
    const isEdit = mode === "edit";

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            pricePerDay: 0,
            pricePerHour: "" as any,
            pricePerWeek: "" as any,
            pricePerMonth: "" as any,
            totalQty: 1,
            isPublished: false,
        },
    });

    // Fetch product details if ID is provided but data isn't, or refresh valid data on open
    useEffect(() => {
        if (open && (productId || initialProduct)) {
            const fetchDetails = async () => {
                setIsFetching(true);
                try {
                    const id = productId || initialProduct?.id;
                    if (id) {
                        const data = await getVendorProduct(id);
                        setProductData(data);

                        // Populate form
                        form.reset({
                            name: data.name,
                            description: data.description || "",
                            category: data.category,
                            pricePerDay: parseFloat(
                                data.pricing.find((p) => p.type === "DAY")?.price || "0"
                            ),
                            pricePerHour:
                                parseFloat(
                                    data.pricing.find((p) => p.type === "HOUR")?.price || "0"
                                ) || ("" as any),
                            pricePerWeek:
                                parseFloat(
                                    data.pricing.find((p) => p.type === "WEEK")?.price || "0"
                                ) || ("" as any),
                            pricePerMonth:
                                parseFloat(
                                    data.pricing.find((p: any) => p.type === "MONTH")?.price || "0"
                                ) || ("" as any),
                            totalQty: data.inventory?.totalQty || 1,
                            isPublished: data.isPublished,
                        });
                        setImagePreview(data.product_image_url);
                    }
                } catch (error) {
                    console.error("Failed to fetch product details", error);
                    toast.error("Failed to load product details");
                    setOpen(false);
                } finally {
                    setIsFetching(false);
                }
            };

            fetchDetails();
        } else if (open && mode === 'add') {
            form.reset({
                name: "",
                description: "",
                category: "",
                pricePerDay: 0,
                pricePerHour: "" as any,
                pricePerWeek: "" as any,
                pricePerMonth: "" as any,
                totalQty: 1,
                isPublished: false,
            });
            setImagePreview(null);
        }
    }, [open, productId, initialProduct, mode, form]);

    // Auto-calculate prices based on hourly rate
    const pricePerHourValue = form.watch("pricePerHour");

    useEffect(() => {
        if (pricePerHourValue) {
            const hourlyRate = parseFloat(pricePerHourValue.toString());
            if (!isNaN(hourlyRate) && hourlyRate > 0) {
                const calculatedDaily = hourlyRate * 24;
                const calculatedMonthly = calculatedDaily * 30;

                // Only update if the field hasn't been manually edited (isDirty check)
                // Note: dirtyFields tracks fields that have been modified by user interactions.
                // We check if the specific field is marked as dirty.
                const { dirtyFields } = form.formState;

                if (!dirtyFields.pricePerDay) {
                    form.setValue("pricePerDay", calculatedDaily, { shouldDirty: false }); // keep it non-dirty so it continues updating? Or mark as not dirty? Usually setValue makes it dirty unless options provided. actually setValue doesn't make it dirty by default in some versions, but we want it to NOT be considered 'manually edited' by this automation. 
                    // However, if I set it programmatically, react-hook-form might not mark it dirty.
                    // But if the USER edits it, it becomes dirty. So checking dirtyFields is correct.
                }

                if (!dirtyFields.pricePerMonth) {
                    form.setValue("pricePerMonth", calculatedMonthly, { shouldDirty: false });
                }
            }
        }
    }, [pricePerHourValue, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate size
            if (file.size > MAX_FILE_SIZE) {
                toast.error("Max file size is 5MB");
                return;
            }
            // Validate type
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                toast.error("Only .jpg, .jpeg, .png and .webp formats are supported");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        if (isView) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("category", data.category);
            formData.append("pricePerDay", data.pricePerDay.toString());
            formData.append("totalQty", data.totalQty.toString());
            formData.append("isPublished", data.isPublished.toString());

            if (data.description) formData.append("description", data.description);
            if (data.pricePerHour)
                formData.append("pricePerHour", data.pricePerHour.toString());
            if (data.pricePerWeek)
                formData.append("pricePerWeek", data.pricePerWeek.toString());
            if (data.pricePerMonth)
                formData.append("pricePerMonth", data.pricePerMonth.toString());

            // Handle image
            if (data.image && data.image.length > 0 && data.image[0] instanceof File) {
                formData.append("productImage", data.image[0]);
            }

            if (isEdit && productData) {
                await updateProduct(productData.id, formData);
                toast.success("Product updated successfully!");
            } else {
                // For create, image is required validation handled by zod schema mostly, 
                // but since we relaxed strict schema check for edit, manual check needed for add
                if (mode === "add" && (!data.image || data.image.length === 0)) {
                    toast.error("Product image is required");
                    setIsLoading(false);
                    return;
                }
                await createProduct(formData);
                toast.success("Product created successfully!");
            }

            setOpen(false);
            if (onProductSaved) {
                onProductSaved();
            }
        } catch (error: any) {
            console.error("Failed to save product:", error);
            toast.error(error.response?.data?.message || "Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    const dialogTitle = {
        add: "Add New Product",
        edit: "Edit Product",
        view: "Product Details",
    }[mode];

    const dialogDesc = {
        add: "Create a new rental product for your inventory",
        edit: "Update product details and pricing",
        view: "View product information",
    }[mode];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="rounded-xl">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl sm:max-h-[90vh] p-0 backdrop-blur-md bg-card/95">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold">{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDesc}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-100px)] p-6">
                    {isFetching ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Image Upload */}
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Product Image</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col items-center justify-center w-full">
                                                    {imagePreview ? (
                                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {!isView && (
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                                                    onClick={() => {
                                                                        setImagePreview(null);
                                                                        onChange(null);
                                                                        // Reset file input
                                                                        const fileInput = document.getElementById(
                                                                            "image-upload"
                                                                        ) as HTMLInputElement;
                                                                        if (fileInput) fileInput.value = "";
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <label
                                                            htmlFor="image-upload"
                                                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl ${isView ? "cursor-default opacity-60" : "cursor-pointer hover:bg-muted/70"
                                                                } bg-muted/50 transition-colors border-muted-foreground/25`}
                                                        >
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                                                {!isView ? (
                                                                    <>
                                                                        <p className="mb-2 text-sm text-muted-foreground">
                                                                            <span className="font-semibold">
                                                                                Click to upload
                                                                            </span>{" "}
                                                                            or drag and drop
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            SVG, PNG, JPG or GIF (MAX. 5MB)
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-muted-foreground">No image uploaded</p>
                                                                )}
                                                            </div>
                                                            <Input
                                                                id="image-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    if (!isView) {
                                                                        handleImageChange(e);
                                                                        onChange(e.target.files);
                                                                    }
                                                                }}
                                                                disabled={isLoading || isView}
                                                                {...field}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Basic Info */}
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Canon EOS R5"
                                                            className="w-full rounded-xl"
                                                            disabled={isLoading || isView}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        disabled={isLoading || isView}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-xl">
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {PRODUCT_CATEGORIES.map(
                                                                (category) =>
                                                                    category.value !== "all" && (
                                                                        <SelectItem
                                                                            key={category.value}
                                                                            value={category.value}
                                                                        >
                                                                            {category.label}
                                                                        </SelectItem>
                                                                    )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="totalQty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            placeholder="1"
                                                            className="rounded-xl"
                                                            disabled={isLoading || isView}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Pricing */}
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="pricePerDay"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price Per Day (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0.00"
                                                            className="rounded-xl"
                                                            disabled={isLoading || isView}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="pricePerHour"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Price Per Hour (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="0.00"
                                                                className="rounded-xl"
                                                                disabled={isLoading || isView}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="pricePerWeek"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Price Per Week (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="0.00"
                                                                className="rounded-xl"
                                                                disabled={isLoading || isView}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="pricePerMonth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Price Per Month (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="0.00"
                                                                className="rounded-xl"
                                                                disabled={isLoading || isView}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your product..."
                                                    className="min-h-[120px] rounded-xl"
                                                    disabled={isLoading || isView}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isPublished"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Publish Product
                                                </FormLabel>
                                                <FormDescription>
                                                    Make this product visible to customers immediately
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isLoading || isView}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-4 pb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => setOpen(false)}
                                        disabled={isLoading}
                                    >
                                        {isView ? "Close" : "Cancel"}
                                    </Button>
                                    {!isView && (
                                        <Button
                                            type="submit"
                                            className="rounded-xl min-w-[120px]"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                isEdit ? "Update Product" : "Create Product"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
