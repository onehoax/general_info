import type { OnDestroy, OnInit } from "@angular/core";
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { RoleData } from "src/app/hexagonal/main/role/domain/role.data";
import type { TreeNode } from "primeng/api";
import { MessageService } from "primeng/api";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TableModule } from "primeng/table";
import { ToolbarModule } from "primeng/toolbar";
import { RatingModule } from "primeng/rating";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { RadioButtonModule } from "primeng/radiobutton";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { AgGridModule } from "ag-grid-angular";
import { PaginationComponent } from "@features/shared/components/pagination/pagination.component";
import type { DynamicDialogRef } from "primeng/dynamicdialog";
import { DialogService } from "primeng/dynamicdialog";
import { RoleCreateComponent } from "@features/main/components/roles/components/manipulate/create.component";
import { TranslateModule } from "@ngx-translate/core";
import { RoleService } from "@hexagonal/main/role/application/role.service";
import type {
  RoleResponse,
  RolesResponse,
} from "@hexagonal/main/role/domain/role-response.interface";
import type { HttpErrorResponse } from "@angular/common/http";
import { objectIsEmpty, joinStringArrayIsArray } from "@hexagonal/shared/domain/utils/object.util";
import { RoleUpdateComponent } from "@features/main/components/roles/components/manipulate/edit.component";
import { PermissionService } from "@hexagonal/main/permission/application/permission.service";
import type { PermissionsResponse } from "@hexagonal/main/permission/domain/permission-response.interface";
import type { PermissionData } from "@hexagonal/main/permission/domain/permission.data";
import { TreeModule } from "primeng/tree";
import { TreeSelectModule } from "primeng/treeselect";
import { DialogComponent } from "@features/main/components/roles/components/dialog/dialog.component";
import { ButtonComponent } from "@features/main/components/roles/components/button/button.component";
import { RoleMethodEnum } from "@hexagonal/main/role/domain/role-method.enum";
import { DialogCloseEventInterface } from "@hexagonal/shared/domain/dialog/dialog-close-event.interface";

@Component({
  selector: "app-role",
  standalone: true,
  providers: [DialogService],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ToolbarModule,
    RatingModule,
    DialogModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    TreeModule,
    TreeSelectModule,
    AgGridModule,
    PaginationComponent,
    TranslateModule,
    RoleCreateComponent,
    DialogComponent,
    ButtonComponent,
  ],
  templateUrl: "./roles.component.html",
})
export class RoleComponent implements OnInit, OnDestroy {
  private readonly messageService: MessageService = inject(MessageService);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly roleService: RoleService = inject(RoleService);

  private readonly permissionService: PermissionService = inject(PermissionService);

  private dialogRef: DynamicDialogRef | undefined;

  public checkIfObjectEmpty = objectIsEmpty;

  public roles: RoleData[] = [];

  public selectedRole: RoleData = {};

  public deleteProductDialog: boolean = false;

  public updatePermissionsDialog: boolean = false;

  public selectedRolePermissions: PermissionData[] = [];

  public availablePermissions: PermissionData[] = [];

  public availablePermissionsTree: TreeNode[] = [];

  public selectedPermissionsTree: TreeNode | TreeNode[] | null = [];

  public MethodEnum: typeof RoleMethodEnum = RoleMethodEnum;

  public ngOnInit(): void {
    this.resetRoles();
    this.getAllPermissions();
  }

  private resetRoles(): void {
    this.selectedRole = {};
    this.clearRolePermissions();
    this.resetTreeProperties();
    this.disableEnableTree(false);
    this.getAllRoles();
  }

  public chooseMethod(flag: string): void {
    this.methodOptions[flag]();
  }

  private readonly methodOptions = {
    [RoleMethodEnum.CREATE]: (): void => this.create(),
    [RoleMethodEnum.UPDATE]: (): void => this.update(),
    [RoleMethodEnum.DELETE]: (): void => this.confirmDelete(),
    [RoleMethodEnum.UPDATE_PERMISSIONS]: (): void => this.updatePermissions(),
    [RoleMethodEnum.REFRESH_PERMISSIONS]: (): void => this.refreshAvailablePermissions(),
    [RoleMethodEnum.OPEN_DELETE_DIALOG]: (): void => {
      this.deleteProductDialog = true;
    },
    [RoleMethodEnum.CLOSE_DELETE_DIALOG]: (): void => {
      this.deleteProductDialog = false;
    },
    [RoleMethodEnum.OPEN_UPDATE_PERMISSIONS_DIALOG]: (): void => {
      this.updatePermissionsDialog = true;
    },
    [RoleMethodEnum.CLOSE_UPDATE_PERMISSIONS_DIALOG]: (): void => {
      this.updatePermissionsDialog = false;
    },
  };

  private getCurrentPermissionsAsIds(): string[] {
    return this.selectedRolePermissions.map((permission: PermissionData): string => {
      return permission.id!;
    });
  }

  private getSelectedPermissionsAsIds(): string[] {
    if (!Array.isArray(this.selectedPermissionsTree))
      this.selectedPermissionsTree = [this.selectedPermissionsTree!];

    const selectedPermissionIds: string[] = [];

    this.selectedPermissionsTree!.forEach((permission: TreeNode): void => {
      if (!permission.data.isParent) selectedPermissionIds.push(permission.key!);
    });

    return selectedPermissionIds;
  }

  private areThereNewPermissions(
    currentPermissions: string[],
    selectedPermissions: string[],
  ): boolean {
    let samePermissions = true;

    const maxLength: number = Math.max(currentPermissions.length, selectedPermissions.length);
    for (let i = 0; samePermissions && i < maxLength; i++) {
      const includes: boolean = selectedPermissions.includes(currentPermissions[i]);
      samePermissions = samePermissions && includes;
    }

    return !samePermissions;
  }

  private getUpdatedPermissions(): string[] | null {
    const currentPermissions: string[] = this.getCurrentPermissionsAsIds();
    const selectedPermissions: string[] = this.getSelectedPermissionsAsIds();

    if (this.areThereNewPermissions(currentPermissions, selectedPermissions)) {
      return selectedPermissions
        .filter((id) => currentPermissions.includes(id))
        .concat(selectedPermissions.filter((id) => !currentPermissions.includes(id)));
    }
    return null;
  }

  public resetTreeProperties(): void {
    this.availablePermissionsTree.forEach((node: TreeNode): void => {
      node.partialSelected = false;
      node.expanded = false;
    });
  }

  public updateExpandTreeProperties(): void {
    this.availablePermissionsTree.forEach((node: TreeNode): void => {
      if (node.partialSelected) node.expanded = true;
    });
  }

  public disableEnableTree(flag: boolean): void {
    this.availablePermissionsTree.forEach((node: TreeNode): void => {
      node.selectable = flag;
      node.children!.forEach((node: TreeNode): void => {
        node.selectable = flag;
      });
    });
  }

  private createPermissionsMap(permissions: PermissionData[]): Map<string, PermissionData[]> {
    const map = new Map<string, PermissionData[]>();

    permissions.forEach((permission: PermissionData): void => {
      const currentModule: string = permission.module!;
      if (map.get(currentModule) === undefined) map.set(currentModule, [permission]);
      else map.get(currentModule)!.push(permission);
    });

    return map;
  }

  /**
   * Create a tree based on a subset of all available permissions (permissions assigned to some role)
   * This serves to visually select the corresponding nodes on the tree with all available permissions depending on the role selected
   *
   * @param {PermissionData[]} permissions
   * @returns {TreeNode[]}
   */
  private arrayToTreeWithoutParents(permissions: PermissionData[]): TreeNode[] {
    const tree: TreeNode[] = [];

    const permissionIds: string[] = permissions.map((permission: PermissionData): string => {
      return permission.id!;
    });

    this.availablePermissionsTree.forEach((node: TreeNode): void => {
      const parent: TreeNode = node;
      const children: TreeNode[] = node.children!;

      children.forEach((child: TreeNode): void => {
        if (permissionIds.includes(child.key!)) {
          tree.push(child);
          if (!parent.partialSelected) parent.partialSelected = true;
        }
      });
    });

    return tree;
  }

  /**
   * Create a tree based on all available permissions
   * E.g.:
   *   - USER
   *     - VIEW
   *     - EDIT
   *   - ROLE
   *     - VIEW
   *     - CREATE
   *
   * @param {PermissionData[]} permissions
   * @returns {TreeNode[]}
   */
  private arrayToTreeWithParents(permissions: PermissionData[]): TreeNode[] {
    const map: Map<string, PermissionData[]> = this.createPermissionsMap(permissions);
    const tree: TreeNode[] = [];

    for (const key of map.keys()) {
      const permissions: PermissionData[] = map.get(key)!;
      const children: TreeNode[] = [];

      permissions.forEach((permission: PermissionData): void => {
        children.push({
          key: permission.id,
          label: permission.description!.toUpperCase(),
          data: {
            isParent: false,
            id: permission.id,
            module: permission.module,
            path: permission.path,
            method: permission.method,
            description: permission.description,
          },
        });
      });

      tree.push({
        key,
        label: key.toUpperCase(),
        data: {
          isParent: true,
        },
        children,
      });
    }

    return tree;
  }

  private updateSelectedRoleName(newName: string): void {
    const currentRole: RoleData = this.selectedRole;
    if (currentRole && !this.checkIfObjectEmpty(currentRole)) {
      currentRole.name = newName;
    }
  }

  private updateSelectedRolePermissions(): void {
    const currentRole: RoleData = this.selectedRole;
    if (currentRole && !this.checkIfObjectEmpty(currentRole)) {
      if (!Array.isArray(this.selectedPermissionsTree))
        this.selectedPermissionsTree = [this.selectedPermissionsTree!];

      this.selectedRolePermissions = this.selectedPermissionsTree
        .filter((node: TreeNode): boolean => !node.data.isParent)
        .map((node: TreeNode): PermissionData => {
          return {
            id: node.data.id,
            module: node.data.module,
            path: node.data.path,
            method: node.data.method,
            description: node.data.description,
          };
        });

      this.selectedRole.permissions = this.selectedRolePermissions.map(
        (permissions: PermissionData): string => {
          return permissions.id!;
        },
      );
    }
  }

  private getAllRoles(): void {
    this.roleService.getAll().subscribe({
      next: (response: RolesResponse): void => {
        this.roles = response.data;
      },
      error: (httpError: HttpErrorResponse): void => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: httpError.error.message,
        });
      },
    });
  }

  public clearRolePermissions(): void {
    this.selectedRolePermissions = [];
    this.selectedPermissionsTree = [];
  }

  public getRolePermissions(): void {
    const role: RoleData = this.selectedRole;
    if (role && role.permissions!.length > 0) {
      this.permissionService.findManyById(role.permissions!).subscribe({
        next: (response: PermissionsResponse): void => {
          this.selectedRolePermissions = response.data;
          this.selectedPermissionsTree = this.arrayToTreeWithoutParents(
            this.selectedRolePermissions,
          );
          this.updateExpandTreeProperties();
        },
        error: (httpError: HttpErrorResponse): void => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: httpError.error.message,
          });
        },
      });
    }
  }

  private getAllPermissions(): void {
    this.permissionService.getAllAvailable().subscribe({
      next: (response: PermissionsResponse): void => {
        this.availablePermissions = response.data;
        this.availablePermissionsTree = this.arrayToTreeWithParents(this.availablePermissions);
        this.disableEnableTree(false);
      },
      error: (httpError: HttpErrorResponse): void => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: httpError.error.message,
        });
      },
    });
  }

  private create(): void {
    this.dialogRef = this.dialogService.open(RoleCreateComponent, {
      styleClass: "p-fluid",
      width: "450px",
      header: "New Role",
      appendTo: "body",
      modal: true,
    });

    this.dialogRef.onClose.subscribe(() => this.resetRoles());
  }

  private update(): void {
    this.dialogRef = this.dialogService.open(RoleUpdateComponent, {
      styleClass: "p-fluid",
      width: "450px",
      header: "Edit Role",
      appendTo: "body",
      modal: true,
      data: {
        selectedRoleId: this.selectedRole.id,
      },
    });

    this.dialogRef.onClose.subscribe((response: DialogCloseEventInterface): void => {
      if (response.data) this.updateSelectedRoleName(<string>response.data.value);
    });
  }

  private updatePermissions(): void {
    const updatedPermissions: string[] | null = this.getUpdatedPermissions();

    if (updatedPermissions) {
      const role: RoleData = {
        permissions: updatedPermissions,
      };

      this.roleService.update(this.selectedRole.id!, role).subscribe({
        next: (response: RoleResponse): void => {
          this.updateSelectedRolePermissions();
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 1000,
          });
        },
        error: (httpError: HttpErrorResponse): void => {
          const errorMessage = joinStringArrayIsArray(httpError.error.message as string[]);
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage,
          });
        },
      });
    } else {
      this.messageService.add({
        severity: "warn",
        summary: "Warn",
        detail: "Nothing to update",
        life: 1000,
      });
    }

    this.updatePermissionsDialog = false;
  }

  private confirmDelete(): void {
    this.roleService.delete(this.selectedRole.id!).subscribe({
      next: (response: RoleResponse): void => {
        this.resetRoles();
        this.messageService.add({
          severity: "success",
          summary: "Successful",
          detail: response.message,
          life: 1000,
        });
      },
      error: (httpError: HttpErrorResponse): void => {
        const errorMessage = joinStringArrayIsArray(httpError.error.message as string[]);
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: errorMessage,
        });
      },
    });

    this.deleteProductDialog = false;
  }

  private refreshAvailablePermissions(): void {
    this.permissionService.refresh().subscribe({
      next: (response: PermissionsResponse): void => {
        this.ngOnInit();
        this.messageService.add({
          severity: "success",
          summary: "Successful",
          detail: response.message,
          life: 1000,
        });
      },
      error: (httpError: HttpErrorResponse): void => {
        const errorMessage = joinStringArrayIsArray(httpError.error.message as string[]);
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: errorMessage,
        });
      },
    });
  }

  public ngOnDestroy(): void {
    if (this.dialogRef) this.dialogRef.close();
  }
}
