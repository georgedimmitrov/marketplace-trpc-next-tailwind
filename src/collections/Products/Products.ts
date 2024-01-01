import { Access, CollectionConfig } from "payload/types";
import { PRODUCT_CATEGORIES } from "../../config";
import {
  AfterChangeHook,
  BeforeChangeHook,
} from "payload/dist/collections/config/types";
import { Product, User } from "../../payload-types";
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

const addUserToProducts: AfterChangeHook<Product> = async ({ req, doc }) => {
  const fullUser = await req.payload.findByID({
    collection: "users",
    id: req.user.id,
  });

  if (fullUser && typeof fullUser === "object") {
    const { products } = fullUser;

    const allProductIds = [
      ...(products?.map((product) =>
        typeof product === "object" ? product.id : product
      ) || []),
    ];

    const createdProductIds = allProductIds.filter(
      (id, i) => allProductIds.indexOf(id) === i
    );

    const dataToUpdate = [...createdProductIds, doc.id];

    await req.payload.update({
      collection: "users",
      id: fullUser.id,
      data: {
        products: dataToUpdate,
      },
    });
  }
};

const isAdminOrHasAccess =
  (): Access =>
  ({ req: { user: _user } }) => {
    const user = _user as User | undefined;

    if (!user) {
      return false;
    }

    if (user.role === "admin") {
      return true;
    }

    const userOwnedProductIds = (user.products || []).reduce<string[]>(
      (allProductIds, product) => {
        if (!product) return allProductIds;

        if (typeof product === "string") {
          allProductIds.push(product);
        } else {
          allProductIds.push(product.id);
        }
        return allProductIds;
      },
      []
    );

    return {
      id: {
        in: userOwnedProductIds,
      },
    };
  };

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: isAdminOrHasAccess(),
    update: isAdminOrHasAccess(),
    delete: isAdminOrHasAccess(),
  },
  hooks: {
    afterChange: [addUserToProducts],
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
