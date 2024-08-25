import {AfterViewInit, Component, OnInit, Renderer, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/index';
import {DataTableDirective} from 'angular-datatables';
import {ToastrService} from 'ngx-toastr';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {FormBuilder} from '@angular/forms';
import {LoadingService} from '../../users/service/loader.service';
import {UserService} from '../../users/service/user.service';
import {AuthService} from '../../users/service/auth.service';
import {Router} from '@angular/router';
import { routerTransition } from '../../router.animations';
import {environment} from '../../../environments/environment';
import {CreateUpdateJobComponent} from '../../modals/jobs/create-update-job/create-update-job.component';
import Swal from "sweetalert2";


@Component({
    selector: 'app-job-list',
    templateUrl: './job-list.component.html',
    styleUrls: ['./job-list.component.scss'],
    animations:[routerTransition()],

})
export class JobListComponent implements OnInit,AfterViewInit{
    modalRef: NgbModalRef;
    dtOptions: any;
    dtTrigger = new Subject();
    listener:any;
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    id: any;
    permission:boolean = false;
    constructor(private authService: AuthService,private renderer: Renderer,public router: Router,private toastr: ToastrService,
                private datePipe: DatePipe,private fb: FormBuilder, public loading:LoadingService,private modalService: NgbModal,
                private userService: UserService) { }

    ngOnInit() {
        this.datatable();
        //get permission list
        this.userService.checkPermissionApi('job-list').then((res) => {
            let permission = res;
            if (permission == true) {
                this.permission = true;
                this.dtTrigger.next();
            }else {
                this.toastr.error("Access Denied");
                this.permission = false;
            }
        })
    }

    // Load data table
    datatable() {
        let self = this;
        this.dtOptions = {
            ajax: {
                url: environment.LDAP_URL + 'jobs/allJobs/',
                type: 'POST',
                'beforeSend': function (request) {
                    var token = window.localStorage.getItem('token');
                    request.setRequestHeader('Authorization', token);
                },
                error: function (res) {
                }, data: function (data) {
                    if(data.order.length > 0){
                        var column_id = data.order[0].column;
                        data.orderBy = data.columns[column_id].data;
                        if(data.orderBy == 'datasource_name')
                            data.orderBy = 'datasource__name_lower';
                        if(data.order[0].dir == 'asc'){
                            data.isAscending = true;
                        }else{
                            data.isAscending = false;
                        }
                    }
                }, dataSrc: function (data) {

                    self.loading.display(false);
                    return data['data'];
                }
            },
            columns: [
                {
                    data: "datasource_name", title: "Data Source/Repository", "render": function (data, type, row, meta) {
                        if(data){
                            $("div.someClass").text(data);
                            return $("<div>").text(data).html();
                        }else {
                            return '-'
                        }
                    }
                },
                {
                    data: "server_path",
                    "orderable": false,
                    title: "Data Source/Repository Server Path", "render": function (data, type, row, meta) {
                        if(data){
                            $("div.someClass").text(data);
                            return $("<div>").text(data).html();
                        }else {
                            return '-'
                        }
                    }
                },
                {
                    data: "schedule_type",
                    "orderable": false,
                    title: "Schedule", "render": function (data, type, row, meta) {
                        let a;
                        let month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        let value;
                        if(data == 'Days'){
                            a = data ?   'Daily' + ' ' + 'at'  + ' ' +row.schedule_duration : '-'
                        }else if(data == 'Months'){
                            a = data ?   'Day of month'+' '+ row.schedule_value + ' ' + 'at'  + ' ' +row.schedule_duration : '-'
                        }else if(data == 'Years'){
                            value = row.schedule_value.split(',')
                            a = data ?   'Day of month'+' '+value[0]  + ', ' + 'Month of Year'+' ' +month[value[1]-1]  + ' ' + 'at'  + ' ' +row.schedule_duration : '-'
                        }else {
                            a = '-';
                        }
                        if (!row.is_repeat_scan) {
                            a = "Disabled"
                        }
                        return a;
                    }
                },
                {
                    data: "operation","title":"Actions",
                    "orderable": false,
                    "searchable": false,
                    "class": "text-center",
                    "render": function(data,type,row,meta) {

                        var userdata = JSON.parse(window.localStorage.getItem('user'));
                        let a;
                        let b;
                        let c;


                        let disabled_att;
                        if(row.job_status == "Running" && !row.is_running_manually){
                            disabled_att = "";
                        }else{
                            disabled_att = "";
                        }

                        if(!row.is_running_manually){
                            c = '<button class="btn btn-outline-info btn-sm mr-2 '+disabled_att +'" placement="top" ngbTooltip="Play" ' +
                                'jobmanualplay-button="'+row.id+'" data-job-status="'+row.job_status+'" jobmanualplay-data="'+row.is_running+'" >' +
                                '<i class="fa fa-play" data-job-status="'+row.job_status+'" jobmanualplay-button="'+row.id+'" jobmanualplay-data="'+row.is_running+'"></i></button>'
                        }else {
                            c = '<button class="btn btn-outline-info btn-sm mr-2" placement="top" ngbTooltip="Stop" ' +
                                'jobmanualstop-button="'+row.id+'" jobmanualstop-data="'+row.is_running+'">' +
                                '<i class="fa fa-stop" jobmanualstop-button="'+row.id+'" jobmanualstop-data="'+row.is_running+'"></i></button>'
                        }
                        /*if(row.job_status =="Stopped"){
                            b = '<button class="btn btn-outline-info btn-sm mr-2" placement="top" ngbTooltip="Play" ' +
                                'jobplay-button="'+row.id+'" jobplay-data="'+row.is_running+'" >' +
                                '<i class="fa fa-clock-o" data-job-status="'+row.job_status+'" jobplay-button="'+row.id+'" jobplay-data="'+row.is_running+'"></i></button>'
                        }else {
                            b = '<button class="btn btn-outline-info btn-sm mr-2" placement="top" ngbTooltip="Stop" ' +
                                'jobstop-button="'+row.id+'" jobstop-data="'+row.is_running+'">' +
                                '<i class="fa fa-stop" jobstop-button="'+row.id+'" jobstop-data="'+row.is_running+'"></i></button>'
                        }*/
                        let disabled_attr;
                        if(row.job_status != "Stopped"){
                            //disabled_attr = "disabled";
                            disabled_attr = "";
                        }else{
                            disabled_attr = "";
                        }
                        a = c + '&nbsp;<button class="btn btn-outline-info btn-sm mr-2 ' + disabled_attr +'" placement="top" ngbTooltip="Edit" ' +
                            'jobuseredit-button="'+row.id+'" isldap-button="'+row.is_ldap+'" data-job-status="'+row.job_status+'" useredit-data="'+row+'">' +
                            '<i class="fa fa-pencil" jobuseredit-button="'+row.id+'" isldap-button="'+row.is_ldap+'" data-job-status="'+row.job_status+'" useredit-data="'+row+'"></i></button>'+
                            '&nbsp;<button class="btn btn-outline-danger btn-sm mr-2 ' + disabled_attr +'"  placement="top" ngbTooltip="Edit" ' +
                            'jobuserdelete-button="'+row.id+'" isldap-button="'+row.is_ldap+'" useredit-data="'+row+'" data-job-status="'+row.job_status+'">' +
                            '<i class="fa fa-trash" jobuserdelete-button="'+row.id+'" isldap-button="'+row.is_ldap+'" data-job-status="'+row.job_status+'"></i></button>'
                        return '<div class="d-flex">'+a+'</div>';
                    }
                },
            ],
            processing: true,
            serverSide: true,
            pagingType: 'full_numbers',
            pageLength: environment.pageLength,
            responsive: true,
            dataType: 'json',
            aaSorting: []
        };

    }
    ngAfterViewInit(): void {
        let self = this;

        this.listener = this.renderer.listenGlobal('document', 'click', (event) => {
            if (event.target.hasAttribute("jobuseredit-button")) {
                let job_status = event.target.getAttribute("data-job-status");
                this.id = event.target.getAttribute("jobuseredit-button");
                this.open('edit');
            }
            if (event.target.hasAttribute("jobuserdelete-button")) {
                this.userService.checkPermissionApi('job-delete').then((res) => {
                    let permission = res;
                    let job_status = event.target.getAttribute("data-job-status");
                    if (permission == true  && job_status == "Stopped") {
                        Swal.fire({
                            title: 'Are you sure?',
                            text: "You won't be able to revert this!",
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete it!'
                        }).then((result) => {
                            if (result.value) {
                                let id = event.target.getAttribute("jobuserdelete-button");
                                this.loading.display(true);
                                this.authService.postLdapRequest('jobs/deleteJob/',{ id: id }).then( (res) => {
                                    this.loading.display(false);
                                    if(res['status'] === 1){
                                        var table = $('#jobs-datatables').DataTable();
                                        table.ajax.reload( null, false );
                                        this.toastr.success(res['msg']);
                                    }else {
                                        this.toastr.error(res['error']);
                                    }
                                })
                                .catch( (err) => {
                                    this.loading.display(false);
                                    this.toastr.error(err);
                                });
                            }
                        });
                    }
                })


            }
            // related html is commented out for jobplay-button
            if (event.target.hasAttribute("jobplay-button")) {
                this.userService.checkPermissionApi('job-control').then((res) => {
                    let permission = res;

                    if (permission == true) {
                        this.loading.display(true);
                        this.authService.postLdapRequest('jobs/startJob/',{ id: event.target.getAttribute("jobplay-button") }).then( (res) => {
                            this.loading.display(false);
                            if(res['status'] === 1){
                                var table = $('#jobs-datatables').DataTable();
                                table.ajax.reload( null, false );
                                this.toastr.success(res['msg']);
                            }else {
                                this.toastr.error(res['error']);
                            }

                        })
                            .catch( (err) => {
                                this.loading.display(false);
                                this.toastr.error(err);
                            });
                    }
                })
            }
            // related html is commented out for jobstop-button
            if (event.target.hasAttribute("jobstop-button")) {
                this.userService.checkPermissionApi('job-control').then((res) => {
                    let permission = res;
                    if (permission == true) {
                        this.loading.display(true);
                        this.authService.postLdapRequest('jobs/stopJob/',{ id: event.target.getAttribute("jobstop-button") }).then( (res) => {
                            if(res['status'] === 1){
                                var table = $('#jobs-datatables').DataTable();
                                table.ajax.reload( null, false );
                                this.toastr.success(res['msg']);
                            }else {
                                this.loading.display(false);
                                this.toastr.error(res['error']);
                            }
                        })
                        .catch( (err) => {
                            this.loading.display(false);
                            this.toastr.error(err);
                        });
                    }
                })
            }

            if (event.target.hasAttribute("jobmanualplay-button")) {
                this.userService.checkPermissionApi('job-control').then((res) => {
                    let permission = res;
                    let job_status = event.target.getAttribute("data-job-status");

                    if (permission == true && job_status != 'Running') {
                        this.loading.display(true);
                        this.authService.postLdapRequest('jobs/startJobManually/',{ id: event.target.getAttribute("jobmanualplay-button") }).then( (res) => {
                            this.loading.display(false);
                            if(res['status'] === 1){
                                var table = $('#jobs-datatables').DataTable();
                                table.ajax.reload( null, false );
                                this.toastr.success(res['msg']);
                            }else {
                                this.toastr.error(res['error']);
                            }
                        })
                            .catch( (err) => {
                                this.loading.display(false);
                                this.toastr.error(err);
                            });
                    }
                })
            }

            if (event.target.hasAttribute("jobmanualstop-button")) {
                this.userService.checkPermissionApi('job-control').then((res) => {
                    let permission = res;
                    if (permission == true) {
                        this.loading.display(true);
                        this.authService.postLdapRequest('jobs/stopJobManually/',{ id: event.target.getAttribute("jobmanualstop-button") }).then( (res) => {
                            this.loading.display(false);
                            if(res['status'] === 1){
                                var table = $('#jobs-datatables').DataTable();
                                table.ajax.reload( null, false );
                                this.toastr.success(res['msg']);
                            }else {
                                this.toastr.error(res['error']);
                            }
                        })
                            .catch( (err) => {
                                this.loading.display(false);
                                this.toastr.error(err);
                            });
                    }
                })
            }
        });
    }

    open(content:any) {
        let msg =  content == 'add' ? 'job-add' : 'job-edit';
        this.loading.display(true);
        this.userService.checkPermissionApi(msg).then((res) => {
            let permission = res;
            if (permission == true) {
                const modalRef = this.modalService.open(CreateUpdateJobComponent, {ariaLabelledBy: 'modal-basic-title', centered: true,
                    size:'lg'});
                if(content == 'add') {
                    modalRef.componentInstance.id = 0;
                    modalRef.componentInstance.mode = 'add';
                } else if(content == 'edit') {
                    modalRef.componentInstance.id = this.id;
                    modalRef.componentInstance.mode = 'edit';
                }
            }
        })
    }


    ngOnDestroy(): void {
        if(this.listener){
            this.listener();
        }
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }

}
