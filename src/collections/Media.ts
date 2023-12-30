import { Access, CollectionConfig } from "payload/types";
import { User } from "../payload-types";

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;

    if (!user) {
      return false; // cannot read the image
    }
    if (user.role === "admin") {
      return true; // can read the image
    }

    // if the user owns the image -> can read the image
    return {
      user: {
        equals: req.user.id,
      },
    };
  };

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // associate the image with the user that created that product (product has an image and user has a product)
        // reason is that we don't want to show the image to other users i.e. "User A" should see only images they uploaded but not for "User B"'s images
        return { ...data, user: req.user.id };
      },
    ],
  },
  // do not want to show the image to other users i.e. "User A" should see only images they uploaded but not for "User B"'s images
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer;

      // if user is not logged in -> show images
      // the URL will only include "/sell" only on the back-end, so if the user is on the front-end viewing the app -> show images
      if (!req.user || !referer?.includes("sell")) {
        return true;
      }

      return await isAdminOrHasAccessToImages()({ req });
    },
    // automatically passes the request
    delete: isAdminOrHasAccessToImages(),
    update: isAdminOrHasAccessToImages(),
  },
  // do not show Media as a separate entity in the CMS panel "/sell" because we add images in the Product collection "create new product" page
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  upload: {
    staticURL: "/media",
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: undefined,
        position: "centre",
      },
    ],
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      label: "User",
      required: true,
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
  ],
};
