console.log("✅ Using WEB Appwrite SDK");

import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Permission,
  Role,
} from "appwrite";

import type {
  CreateUserParams,
  GetMenuParams,
  SignInParams,
  User,
  Property,
} from "@repo/types";

// ──────────────────────────────
// Config
// ──────────────────────────────
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,

  databaseId: "68bce2d600248f0e80dc",
  bucketId: "68c006420014eaa23432",

  userCollectionId: "user",
  propertiesCollectionId: "properties",

  categoriesCollectionId: "68643a390017b239fa0f",
  menuCollectionId: "68643ad80027ddb96920",
  customizationsCollectionId: "68643c0300297e5abc95",
  menuCustomizationsCollectionId: "68643cd8003580ecdd8f",
  packsCollectionId: "packs",
  ordersCollectionId: "orders",
  productsCollectionId: "products",
  packItemsCollectionId: "pack_items",
};

// ✅ Web client (no setPlatform)
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

// ──────────────────────────────
// Auth
// ──────────────────────────────
export async function signOut() {
  try {
    await account.deleteSession("current");
  } catch {}
}

export async function signIn({ email, password }: SignInParams) {
  const wanted = email.trim().toLowerCase();
  try {
    const me = await account.get().catch(() => null);
    if (me?.email?.toLowerCase() === wanted) return me;
    if (me) await account.deleteSession("current");
    return await account.createEmailPasswordSession(wanted, password);
  } catch (e) {
    throw toError(e);
  }
}

export async function createUser({ email, password, name }: CreateUserParams) {
  try {
    await signOut();
    const newAccount = await account.create(ID.unique(), email, password, name);
    const avatarUrl = avatars.getInitials(name || email);

    await signIn({ email, password });

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        email,
        name,
        accountId: newAccount.$id,
        avatar: avatarUrl,
        role: "guest",
        hotelId: null,
        currentPropertyId: null,
      },
      [
        Permission.read(Role.users()),
        Permission.update(Role.user(newAccount.$id)),
        Permission.delete(Role.user(newAccount.$id)),
      ]
    );
  } catch (e) {
    throw toError(e);
  }
}

async function ensureUserProfile(currentAccount: {
  $id: string;
  name?: string | null;
  email?: string | null;
}): Promise<User> {
  const { $id: accountId } = currentAccount;

  const found = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal("accountId", accountId)]
  );

  if (found.documents.length > 0) {
    return found.documents[0] as unknown as User;
  }

  const name =
    currentAccount.name ||
    (currentAccount.email ?? "").split("@")[0] ||
    "Guest";
  const avatarUrl = avatars.getInitials(name);

  const created = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    {
      accountId,
      name,
      email: currentAccount.email ?? "",
      avatar: avatarUrl,
      role: "guest",
      hotelId: null,
      currentPropertyId: null,
    },
    [
      Permission.read(Role.users()),
      Permission.update(Role.user(accountId)),
      Permission.delete(Role.user(accountId)),
    ]
  );

  return created as unknown as User;
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get().catch(() => null);
    if (!currentAccount) return null;
    const profile = await ensureUserProfile(currentAccount);
    return profile;
  } catch (e) {
    console.log("getCurrentUser error", e);
    throw toError(e);
  }
}

// ──────────────────────────────
// Users
// ──────────────────────────────
export async function listUsers(limit = 50) {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    []
  );
  return res.documents as unknown as User[];
}

export async function updateUserProfile(
  userDocId: string,
  updates: {
    role?: "guest" | "host" | "admin";
    hotelId?: string | null;
    currentPropertyId?: string | null;
  }
) {
  const res = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userDocId,
    updates
  );
  return res as unknown as User;
}

// ──────────────────────────────
// Properties
// ──────────────────────────────
export async function listProperties(): Promise<Property[]> {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.propertiesCollectionId,
    []
  );
  return res.documents as unknown as Property[];
}

export async function createProperty(data: {
  name: string;
  code: string;
  address?: string;
  active?: boolean;
}) {
  const res = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.propertiesCollectionId,
    ID.unique(),
    {
      name: data.name,
      code: data.code,
      address: data.address ?? "",
      active: data.active ?? true,
    }
  );
  return res as unknown as Property;
}

export async function findPropertyByCode(
  code: string
): Promise<Property | null> {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.propertiesCollectionId,
    [Query.equal("code", code)]
  );
  return (res.documents[0] as unknown as Property) ?? null;
}

export async function setCurrentProperty(
  userDocId: string,
  propertyId: string | null
) {
  const res = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userDocId,
    { currentPropertyId: propertyId }
  );
  return res as unknown as User;
}

// ──────────────────────────────
// Domain APIs
// ──────────────────────────────
export async function getMenu({ category, query }: GetMenuParams) {
  try {
    const queries: string[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries
    );

    return menus.documents;
  } catch (e) {
    throw toError(e);
  }
}

export async function getCategories() {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId
    );
    return categories.documents;
  } catch (e) {
    throw toError(e);
  }
}

export async function createPropertyForCurrentUser(data: {
  name: string;
  code: string;
  address?: string;
  active?: boolean;
}) {
  const code = data.code.trim().toUpperCase();
  const me = await account.get();
  const profile = await getCurrentUser();
  if (!profile) throw new Error("No user profile found");

  const existing = await findPropertyByCode(code);
  if (existing) {
    throw new Error("Property code already in use.");
  }

  const prop = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.propertiesCollectionId,
    ID.unique(),
    {
      name: data.name,
      code,
      address: data.address ?? "",
      active: data.active ?? true,
    },
    [
      Permission.read(Role.users()),
      Permission.update(Role.user(me.$id)),
      Permission.delete(Role.user(me.$id)),
    ]
  );

  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    profile.$id,
    { currentPropertyId: (prop as any).$id }
  );

  return prop as unknown as Property;
}

export async function joinPropertyByCode(codeInput: string) {
  const code = codeInput.trim().toUpperCase();
  if (!code) throw new Error("Enter a property code.");

  const profile = await getCurrentUser();
  if (!profile) throw new Error("Not signed in.");

  const prop = await findPropertyByCode(code);
  if (!prop) throw new Error("No property found for that code.");

  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    profile.$id,
    { currentPropertyId: (prop as any).$id }
    
  );

  

  return prop;
}
