import * as z from "zod";

const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // 3MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const fileSchema = z
  .instanceof(File, { message: "Product image is required" })
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    `File size must be less than ${MAX_FILE_SIZE_MB}MB`,
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported",
  );

export const orderFormSchema = z.object({
  invoiceNumber: z.string().min(1, { message: "Invoice no is required" }),
  totalAmount: z.coerce
    .number({
      invalid_type_error: "Total amount must be a number",
    })
    .int({ message: "Total amount must be a whole number" })
    .min(0, { message: "Total amount cannot be negative" }),
  customer: z.string().min(1, { message: "Customer is required" }),
  coupon: z.string(),
  paymentMethod: z.string(),
  shipping: z.coerce
    .number({
      invalid_type_error: "Shipping cost must be a number",
    })
    .int({ message: "Shipping cost must be a whole number" })
    .min(0, { message: "Shipping cost cannot be negative" }),
  status: z.string(),
});
// .superRefine((data, ctx) => {
//   if (data.salesPrice <= data.costPrice) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "Sales price must be greater than cost price",
//       path: ["salesPrice"],
//     });
//   }

//   if (data.minStockThreshold > data.stock) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message:
//         "Minimum stock threshold cannot be greater than the total stock",
//       path: ["minStockThreshold"],
//     });
//   }
// });

export const productBulkFormSchema = z
  .object({
    published: z.coerce.boolean().optional(),
    category: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (typeof data.published === "undefined" && data.category === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of the fields must be filled.",
        path: ["published"],
      });
    }
  });

export type OrderFormData = z.infer<typeof orderFormSchema>;
export type ProductBulkFormData = z.infer<typeof productBulkFormSchema>;
