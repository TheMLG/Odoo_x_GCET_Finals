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
import { createProduct } from "@/lib/vendorApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
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
  pricePerDay: z.coerce.number().min(0, "Daily price must be at least 0"),
  pricePerHour: z.coerce.number().optional().or(z.literal("")),
  pricePerWeek: z.coerce.number().optional().or(z.literal("")),
  totalQty: z.coerce.number().min(0, "Quantity must be at least 0"),
  isPublished: z.boolean().default(false),
  image: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Image is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`,
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function VendorAddProduct() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attributeSchemaRows, setAttributeSchemaRows] = useState<
    Array<{ name: string; options: string }>
  >([{ name: "", options: "" }]);
  const [variants, setVariants] = useState<
    Array<{
      name?: string;
      attributes: Record<string, string>;
      pricePerHour?: number | "";
      pricePerDay?: number | "";
      pricePerWeek?: number | "";
      pricePerMonth?: number | "";
      totalQty: number | "";
      isActive: boolean;
    }>
  >([]);

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

  const normalizeAttributeSchema = () => {
    return attributeSchemaRows
      .map((row) => ({
        name: row.name.trim(),
        options: row.options
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean),
      }))
      .filter((row) => row.name && row.options.length > 0);
  };

  const validateVariantCombos = (
    schema: Array<{ name: string; options: string[] }>,
    rows: typeof variants,
  ) => {
    const seen = new Set<string>();
    for (const row of rows) {
      const comboKey = JSON.stringify(
        schema.reduce((acc, attr) => {
          acc[attr.name] = row.attributes?.[attr.name] || "";
          return acc;
        }, {} as Record<string, string>),
      );
      if (seen.has(comboKey)) return false;
      seen.add(comboKey);
    }
    return true;
  };

  const attributeSchema = normalizeAttributeSchema();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const attributeSchema = normalizeAttributeSchema();
      const hasVariants = variants.length > 0;

      if (hasVariants) {
        if (attributeSchema.length === 0) {
          toast.error("Please define attribute schema before adding variants");
          setIsLoading(false);
          return;
        }

        for (const row of variants) {
          for (const attr of attributeSchema) {
            if (!row.attributes?.[attr.name]) {
              toast.error(`Please select ${attr.name} for all variants`);
              setIsLoading(false);
              return;
            }
          }
          if (!row.pricePerDay || Number(row.pricePerDay) <= 0) {
            toast.error("Variant price per day must be greater than 0");
            setIsLoading(false);
            return;
          }
          if (row.totalQty === "" || Number(row.totalQty) < 0) {
            toast.error("Variant quantity must be 0 or greater");
            setIsLoading(false);
            return;
          }
        }

        if (!validateVariantCombos(attributeSchema, variants)) {
          toast.error("Duplicate variant combinations are not allowed");
          setIsLoading(false);
          return;
        }
      } else {
        if (!data.pricePerDay || data.pricePerDay < 1) {
          toast.error("Daily price must be at least 1");
          setIsLoading(false);
          return;
        }
        if (!data.totalQty || data.totalQty < 1) {
          toast.error("Quantity must be at least 1");
          setIsLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("productImage", data.image[0]);
      formData.append("category", data.category);
      formData.append("pricePerDay", data.pricePerDay.toString());
      formData.append("totalQty", data.totalQty.toString());
      formData.append("isPublished", data.isPublished.toString());

      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.pricePerHour) {
        formData.append("pricePerHour", data.pricePerHour.toString());
      }
      if (data.pricePerWeek) {
        formData.append("pricePerWeek", data.pricePerWeek.toString());
      }

      if (attributeSchema.length > 0) {
        formData.append("attributeSchema", JSON.stringify(attributeSchema));
      }
      if (hasVariants) {
        const variantsPayload = variants.map((v) => ({
          name: v.name || null,
          attributes: v.attributes || {},
          pricePerHour:
            v.pricePerHour !== "" && v.pricePerHour !== undefined ?
              Number(v.pricePerHour)
            : null,
          pricePerDay: Number(v.pricePerDay || 0),
          pricePerWeek:
            v.pricePerWeek !== "" && v.pricePerWeek !== undefined ?
              Number(v.pricePerWeek)
            : null,
          pricePerMonth:
            v.pricePerMonth !== "" && v.pricePerMonth !== undefined ?
              Number(v.pricePerMonth)
            : null,
          totalQty: Number(v.totalQty || 0),
          isActive: v.isActive !== false,
        }));
        formData.append("variants", JSON.stringify(variantsPayload));
      }

      await createProduct(formData);
      toast.success("Product created successfully!");
      navigate("/vendor/products");
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground mt-1">
            Create a new rental product for your inventory
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
                                setImagePreview(null);
                                onChange(null);
                                // Reset file input
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
                            className="w-full rounded-xl"
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

              {/* Attribute Schema */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Attributes</h3>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      setAttributeSchemaRows((prev) => [
                        ...prev,
                        { name: "", options: "" },
                      ])
                    }
                  >
                    Add Attribute
                  </Button>
                </div>

                {attributeSchemaRows.map((row, index) => (
                  <div
                    key={`attr-${index}`}
                    className="grid gap-3 md:grid-cols-5"
                  >
                    <Input
                      placeholder="Attribute name"
                      className="rounded-xl md:col-span-2"
                      value={row.name}
                      onChange={(e) =>
                        setAttributeSchemaRows((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, name: e.target.value } : r,
                          ),
                        )
                      }
                      disabled={isLoading}
                    />
                    <Input
                      placeholder="Options (comma-separated)"
                      className="rounded-xl md:col-span-2"
                      value={row.options}
                      onChange={(e) =>
                        setAttributeSchemaRows((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, options: e.target.value } : r,
                          ),
                        )
                      }
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-xl"
                      onClick={() =>
                        setAttributeSchemaRows((prev) =>
                          prev.length > 1 ?
                            prev.filter((_, i) => i !== index)
                          : prev,
                        )
                      }
                      disabled={isLoading || attributeSchemaRows.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Use comma-separated values for options, e.g. Red, Blue, Black
                </p>
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Variants</h3>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      setVariants((prev) => [
                        ...prev,
                        {
                          name: "",
                          attributes: {},
                          pricePerHour: "",
                          pricePerDay: "",
                          pricePerWeek: "",
                          pricePerMonth: "",
                          totalQty: "",
                          isActive: true,
                        },
                      ])
                    }
                  >
                    Add Variant
                  </Button>
                </div>

                {variants.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add variants if this product has multiple options (size,
                    color, etc.).
                  </p>
                )}

                {variants.map((variant, vIndex) => (
                  <div
                    key={`variant-${vIndex}`}
                    className="rounded-2xl border p-4 space-y-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        placeholder="Variant name (optional)"
                        className="rounded-xl"
                        value={variant.name || ""}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex ? { ...v, name: e.target.value } : v,
                            ),
                          )
                        }
                        disabled={isLoading}
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Quantity"
                        className="rounded-xl"
                        value={variant.totalQty}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex ?
                                { ...v, totalQty: e.target.value }
                              : v,
                            ),
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>

                    {attributeSchema.length > 0 && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {attributeSchema.map((attr) => (
                          <div key={`${vIndex}-${attr.name}`} className="space-y-2">
                            <Label>{attr.name}</Label>
                            <Select
                              value={variant.attributes?.[attr.name] || ""}
                              onValueChange={(value) =>
                                setVariants((prev) =>
                                  prev.map((v, i) =>
                                    i === vIndex ?
                                      {
                                        ...v,
                                        attributes: {
                                          ...v.attributes,
                                          [attr.name]: value,
                                        },
                                      }
                                    : v,
                                  ),
                                )
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder={`Select ${attr.name}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {attr.options.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-4">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Price/Day"
                        className="rounded-xl"
                        value={variant.pricePerDay}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex ?
                                { ...v, pricePerDay: e.target.value }
                              : v,
                            ),
                          )
                        }
                        disabled={isLoading}
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Price/Hour"
                        className="rounded-xl"
                        value={variant.pricePerHour}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex ?
                                { ...v, pricePerHour: e.target.value }
                              : v,
                            ),
                          )
                        }
                        disabled={isLoading}
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Price/Week"
                        className="rounded-xl"
                        value={variant.pricePerWeek}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex ?
                                { ...v, pricePerWeek: e.target.value }
                              : v,
                            ),
                          )
                        }
                        disabled={isLoading}
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Price/Month"
                        className="rounded-xl"
                        value={variant.pricePerMonth}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex ?
                                { ...v, pricePerMonth: e.target.value }
                              : v,
                            ),
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={variant.isActive}
                        onCheckedChange={(value) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === vIndex ? { ...v, isActive: !!value } : v,
                            ),
                          )
                        }
                        disabled={isLoading}
                      />
                      <Label>Active</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        className="ml-auto rounded-xl"
                        onClick={() =>
                          setVariants((prev) =>
                            prev.filter((_, i) => i !== vIndex),
                          )
                        }
                        disabled={isLoading}
                      >
                        Remove Variant
                      </Button>
                    </div>
                  </div>
                ))}
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
                      Creating...
                    </>
                    : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </VendorLayout>
  );
}
