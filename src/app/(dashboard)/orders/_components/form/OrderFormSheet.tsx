"use client";

import { useRef, LegacyRef, useState, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

import {
  FormSheetContent,
  FormSheetBody,
  FormSheetHeader,
  FormSheetFooter,
} from "@/components/shared/form/FormSheet";
import {
  FormTextInput,
  FormCategoryInput,
  FormImageInput,
  FormPriceInput,
  FormSlugInput,
  FormTextarea,
} from "@/components/shared/form";
import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";

import { OrderFormData, orderFormSchema } from "./schema";
import { objectToFormData } from "@/helpers/objectToFormData";
import { ProductServerActionResponse } from "@/types/server-action";

type BaseProductFormProps = {
  title: string;
  description: string;
  submitButtonText: string;
  actionVerb: string;
  children: React.ReactNode;
  action: (formData: FormData) => Promise<ProductServerActionResponse>;
};

type AddProductFormProps = BaseProductFormProps & {
  initialData?: never;
  previewImage?: never;
};

type EditProductFormProps = BaseProductFormProps & {
  initialData: Partial<OrderFormData>;
  previewImage: string;
};

type ProductFormProps = AddProductFormProps | EditProductFormProps;

export default function OrderFormSheet({
  title,
  description,
  submitButtonText,
  actionVerb,
  initialData,
  previewImage,
  children,
  action,
}: ProductFormProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [container, setContainer] = useState(null);
  const imageDropzoneRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLButtonElement>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      invoiceNumber: "",
      totalAmount: 0,
      customer: "",
      coupon: "",
      status: "",
      paymentMethod: "",
      shipping: "",
      ...initialData,
    },
  });

  useEffect(() => {
    form.reset(initialData);
  }, [form, initialData]);

  const onSubmit = (data: OrderFormData) => {
    const formData = objectToFormData(data);

    startTransition(async () => {
      const result = await action(formData);

      if ("validationErrors" in result) {
        Object.keys(result.validationErrors).forEach((key) => {
          form.setError(key as keyof OrderFormData, {
            message: result.validationErrors![key],
          });
        });

        form.setFocus(
          Object.keys(result.validationErrors)[0] as keyof OrderFormData,
        );
      } else if ("dbError" in result) {
        toast.error(result.dbError);
      } else {
        form.reset();
        toast.success(
          `Product "${result.product.name}" ${actionVerb} successfully!`,
          { position: "top-center" },
        );
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setIsSheetOpen(false);
      }
    });
  };

  const onInvalid = (errors: FieldErrors<OrderFormData>) => {
    if (errors.image) {
      imageDropzoneRef.current?.focus();
    } else if (errors.category) {
      categoryRef.current?.focus();
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      {children}

      <SheetContent className="w-[90%] max-w-5xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="size-full"
          >
            <FormSheetContent>
              <FormSheetHeader>
                <div className="flex flex-col">
                  <SheetTitle>{title}</SheetTitle>
                  <SheetDescription>{description}</SheetDescription>
                </div>
              </FormSheetHeader>

              <FormSheetBody>
                <div
                  className="space-y-6"
                  ref={setContainer as LegacyRef<HTMLDivElement>}
                >
                  <FormTextInput
                    control={form.control}
                    name="invoiceNumber"
                    label="Invoice No"
                    placeholder="Invoice No"
                  />

                  <FormTextarea
                    control={form.control}
                    name="totalAmount"
                    label="Total amount"
                    placeholder="Total amount"
                  />

                  <FormTextarea
                    control={form.control}
                    name="customer"
                    label="Customer"
                    placeholder="Customer"
                  />

                  <FormImageInput
                    control={form.control}
                    name="customer"
                    label="Customer"
                    previewImage={previewImage}
                    ref={imageDropzoneRef}
                  />

                  <FormTextInput
                    control={form.control}
                    name="sku"
                    label="Product SKU"
                    placeholder="Product SKU"
                  />

                  <FormCategoryInput
                    control={form.control}
                    name="category"
                    label="Category"
                    container={container || undefined}
                    ref={categoryRef}
                  />

                  <FormPriceInput
                    control={form.control}
                    name="costPrice"
                    label="Cost Price"
                    placeholder="Original Price"
                  />

                  <FormPriceInput
                    control={form.control}
                    name="salesPrice"
                    label="Sale Price"
                    placeholder="Sale Price"
                  />

                  <FormTextInput
                    control={form.control}
                    name="stock"
                    label="Product Quantity"
                    placeholder="Product Quantity"
                    type="number"
                  />

                  <FormTextInput
                    control={form.control}
                    name="minStockThreshold"
                    label="Min Stock Threshold"
                    placeholder="Minimum Stock Threshold"
                    type="number"
                  />

                  <FormSlugInput
                    form={form}
                    control={form.control}
                    name="slug"
                    label="Product Slug"
                    placeholder="Product Slug"
                    generateSlugFrom="name"
                  />
                </div>
              </FormSheetBody>

              <FormSheetFooter>
                <FormSubmitButton isPending={isPending} className="w-full">
                  {submitButtonText}
                </FormSubmitButton>
              </FormSheetFooter>
            </FormSheetContent>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
