import {Component, OnInit, ViewChild} from '@angular/core';
import {ResultMasterColumnTypes, SearchResultRow, ResultMasterPanelTabColumn,
  UserInfo, Tenant, AccessGroup} from '../index';
import {ApiService} from '../services/api/api.service';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from './user.service';
import {GroupService} from './group.service';
import {ITreeOptions, TreeComponent, TreeNode} from 'angular-tree-component';

@Component({
  selector: 'app-users-manage',
  templateUrl: './users-manage.component.html'
})
export class UsersManageComponent implements OnInit {
  selectedType: string;
  selectedTitle: string;
  query: string;
  dataColumns = [];
  treeNodes = [];
  private usersDataColumns = [];
  private groupsDataColumns = [];
  private tenantsById = [];
  public dataRows: SearchResultRow[];
  isLoading = false;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  options: ITreeOptions = {
    actionMapping: {
      mouse: {
        click: this.treeNodeClick.bind(this)
      }
    }
  };

  constructor(private apiService: ApiService, private userService: UserService,
              private groupService: GroupService, private translate: TranslateService) {}

  ngOnInit() {

    this.translate.get('applications.root').subscribe(() => {
      this.usersDataColumns = [
        { name: 'login',
          label: this.translate.instant('users.login'),
          type: ResultMasterColumnTypes.STRING,
          link: true},
        { name: 'fullName',
          label: this.translate.instant('users.fullName'),
          type: ResultMasterColumnTypes.STRING,
          link: true},
        { name: 'email',
          label: this.translate.instant('users.email'),
          type: ResultMasterColumnTypes.STRING,
          link: true},
        { name: 'lang',
          label: this.translate.instant('users.lang'),
          type: ResultMasterColumnTypes.STRING,
          link: false},
        { name: 'tenant',
          label: this.translate.instant('users.tenant'),
          type: ResultMasterColumnTypes.STRING,
          link: false},
        { name: 'groups',
          label: this.translate.instant('users.groups'),
          type: ResultMasterColumnTypes.STRING,
          link: false}
      ];

      this.groupsDataColumns = [
        {
          name: 'name',
          label: this.translate.instant('search.data.title'),
          hidden: false,
          type: ResultMasterColumnTypes.STRING,
          sortable: true,
          link: true
        }
      ];

      this.apiService.getTenants().subscribe((tenants: Tenant[]) => {
        tenants.map((tenant: Tenant) => {
          this.tenantsById[tenant.uuid] = tenant.name;
        });

        this.treeNodes.push({
            id: 'users',
            name: this.translate.instant('users.users'),
            hasChildren: false
          },
          {
            id: 'groups',
            name: this.translate.instant('users.groups'),
            hasChildren: false
          }
        );

        this.tree.treeModel.update();
        this.treeNodeClick();
      });



    });
  }

  showUsers() {
    this.selectedTitle = this.translate.instant('users.users');
    this.selectedType = 'users';
    this.dataColumns = this.usersDataColumns;
    this.isLoading = true;
    this.apiService.getUsers(this.query === '' ? undefined : this.query).subscribe((items: UserInfo[]) => {
      this.isLoading = false;
      this.dataRows = items.map((obj: UserInfo) => {
        return new SearchResultRow({
          id: obj.id,
          columns: [
            {name: 'login', value: obj.id},
            {name: 'fullName', value: obj.fullName},
            {name: 'email', value: obj.email},
            {name: 'lang', value: obj.lang},
            {name: 'tenant', value: obj.tenantId ? (this.tenantsById[obj.tenantId] || obj.tenantId) : ''},
            {name: 'groups', value: obj.groups.filter((v: string) => v !== obj.id).join(', ')}
            ]
        });
      });
    });
  }

  showGroups() {
    this.selectedTitle = this.translate.instant('users.groups');
    this.selectedType = 'groups';
    this.dataColumns = this.groupsDataColumns;
    this.isLoading = true;
    this.apiService.getGroups(this.query === '' ? undefined : this.query).subscribe((items: AccessGroup[]) => {
      this.isLoading = false;
      this.dataRows = items.map((obj: AccessGroup) => {
        return new SearchResultRow({
          id: obj.id,
          columns: [{name: 'name', value: obj.title}]
        });
      });
    });
  }

  treeNodeClick(tree?, node?: TreeNode) {
    if (node && node.hasChildren) {
      return;
    }

    const id = (node ? node.id : 'users');

    this.selectedType = id;

    this.refresh();


    if (node) {
      node.setIsActive(true);
    } else {
      this.tree.treeModel.getNodeById(id).setIsActive(true)
    }
  }

  refresh(): void {
    if (this.selectedType === 'users') {
      this.showUsers();
    } else {
      this.showGroups();
    }
  }

  onItemOpen(link: {row: SearchResultRow, col: ResultMasterPanelTabColumn}) {
    if (this.selectedType === 'users') {
      this.userService.open(link.row.id).subscribe(() => {
        this.refresh();
      });
    } else {
      this.groupService.open(link.row.id).subscribe(() => {
        this.refresh();
      });
    }
  }

  addGroup() {
    this.groupService.create().subscribe(() => {
      this.refresh();
    });
  }

}
