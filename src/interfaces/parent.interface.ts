export interface ParentPermissions {
    canView: boolean;
    canDownload: boolean;
  }
  
  export interface Parent {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    childName: string;
    childAge: number;
    permissions: ParentPermissions;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }