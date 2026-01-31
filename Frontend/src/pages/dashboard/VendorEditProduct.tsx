import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { getVendorProduct, updateProduct } from "@/lib/vendorApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  totalQty: z.coerce.number().min(1, "Quantity must be at least 1"),
  isPublished: z.boolean().default(false),
  image: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`,
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function VendorEditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      pricePerDay: 0,
      pricePerHour: "" as any,
      pricePerWeek: "" as any,
      totalQty: 1,
      isPublished: false,
    },
  });

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    try {
      const product = await getVendorProduct(id);

      const dayPrice =
        product.pricing.find((p) => p.type === "DAY")?.price || "0";
      const hourPrice = product.pricing.find((p) => p.type === "HOUR")?.price;
      const weekPrice = product.pricing.find((p) => p.type === "WEEK")?.price;

      form.reset({
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        pricePerDay: parseFloat(dayPrice),
        pricePerHour: hourPrice ? parseFloat(hourPrice) : ("" as any),
        pricePerWeek: weekPrice ? parseFloat(weekPrice) : ("" as any),
        totalQty: product.inventory?.totalQty || 0,
        isPublished: product.isPublished,
      });

      if (product.product_image_url) {
        setImagePreview(product.product_image_url);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast.error("Failed to load product details");
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!productId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("pricePerDay", data.pricePerDay.toString());
      formData.append("totalQty", data.totalQty.toString());
      formData.append("isPublished", data.isPublished.toString());

      if (data.image && data.image.length > 0) {
        formData.append("productImage", data.image[0]);
      }

      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.pricePerHour) {
        formData.append("pricePerHour", data.pricePerHour.toString());
      }
      if (data.pricePerWeek) {
        formData.append("pricePerWeek", data.pricePerWeek.toString());
      }

      await updateProduct(productId, formData);
      toast.success("Product updated successfully!");
      navigate("/vendor/products");
    } catch (error: any) {
      console.error("Failed to update product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <VendorLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
            asChild
          >
            <Link to="/vendor/products">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update your product details and inventory
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border shadow-sm p-6 md:p-8"
        >
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
                        {imagePreview ?
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={() => {
                                // If clearing image, we might want to revert to original or handle differently
                                // allowing to upload new one.
                                // For now just clear preview to allow upload new one
                                // But real impl might keep old URL unless replaced.
                                // Logic: if imagePreview is URL, it's existing. If dataURI, it's new.
                                // If checking for change, we only append 'productImage' if file selected.
                                // So 'X' button here mainly serves to remove NEWLY selected file.
                                // If removing EXISTING image is allowed, backend needs to handle "delete image".
                                // For MVP, assume image is required always.
                                // Let's just allow replacing.
                                // If use clicks X, we clear file input.
                                // If there was existing image, maybe show it again?
                                // Simplification: X clears preview. If no preview, show upload.
                                setImagePreview(null);
                                onChange(null);
                                const fileInput = document.getElementById(
                                  "image-upload",
                                ) as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        : <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors border-muted-foreground/25"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                SVG, PNG, JPG or GIF (MAX. 5MB)
                              </p>
                            </div>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageChange(e);
                                onChange(e.target.files);
                              }}
                              disabled={isLoading}
                              {...field}
                            />
                          </label>
                        }
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
                            className="rounded-xl"
                            disabled={isLoading}
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
                          value={field.value}
                          disabled={isLoading}
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
                                ),
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => navigate("/vendor/products")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl min-w-[120px]"
                  disabled={isLoading}
                >
                  {isLoading ?
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  : "Update Product"}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </VendorLayout>
  );
}
