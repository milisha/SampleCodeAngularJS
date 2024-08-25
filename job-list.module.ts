import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobListRoutingModule } from './job-list-routing.module';
import { JobListComponent } from './job-list.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DataTablesModule} from 'angular-datatables';
import {CreateUpdateJobComponent} from '../../modals/jobs/create-update-job/create-update-job.component';
import {CreateUpdateJobModule} from '../../modals/jobs/create-update-job/create-update-job.module';

@NgModule({
  imports: [
    CommonModule,
    JobListRoutingModule,
      DataTablesModule,
      NgbModule,
      CreateUpdateJobModule
  ],
  declarations: [JobListComponent],
    entryComponents: [CreateUpdateJobComponent]
})
export class JobListModule { }
