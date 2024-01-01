import { CollectionConfig } from "payload/types";
import { PRODUCT_CATEGORIES } from "../../config";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Product } from "../../payload-types";
import { stripe } from "../../lib/stripe";

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user;

  return {
    ...data,
    user: user.id,
  };
};

const addProductToStripe: BeforeChangeHook<Product> = async (args) => {
  if (args.operation === "create") {
    const data = args.data as Product;

    const createdProduct = await stripe.products.create({
      name: data.name,
      default_price_data: {
        currency: "USD",
        unit_amount: Math.round(data.price * 100),
      },
    });

    const updated: Product = {
      ...data,
      stripe_id: createdProduct.id,
      price_id: createdProduct.default_price as string,
    };

    return updated;
  } else if (args.operation === "update") {
    const data = args.data as Product;

    const updatedProduct = await stripe.products.update(data.stripe_id!, {
      name: data.name,
      default_price: data.price_id!,
    });

    const updated: Product = {
      ...data,
      stripe_id: updatedProduct.id,
      price_id: updatedProduct.default_price as string,
    };

    return updated;
  }
};

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  access: {},
  hooks: {
    beforeChange: [addUser, addProductToStripe],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        condition: () => false, // hides the field from the admin dashboard
      },
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      label: "Product details",
      type: "textarea",
    },
    {
      name: "price",
      label: "Price in USD",
      min: 0,
      max: 1000,
      type: "number",
      required: true,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    {
      name: "product_files",
      label: "Product file(s)",
      type: "relationship",
      required: true,
      relationTo: "product_files",
      hasMany: false,
    },
    {
      name: "approved_for_sale",
      label: "Product Status",
      type: "select",
      defaultValue: "pending",
      // only admins should be able to change "approved_for_sale" setting
      access: {
        create: ({ req }) => req.user.role === "admin",
        read: ({ req }) => req.user.role === "admin",
        update: ({ req }) => req.user.role === "admin",
      },
      options: [
        {
          label: "Pending verification",
          value: "pending",
        },
        {
          label: "Approved",
          value: "approved",
        },
        {
          label: "Rejected",
          value: "rejected",
        },
      ],
    },
    {
      name: "price_id",
      // "price_id" only changed by back-end
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "stripe_id",
      // "stripe_id" only changed by back-end
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "images",
      type: "array",
      label: "Product images",
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
};
