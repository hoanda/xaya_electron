import { Component, OnInit, OnDestroy, ChangeDetectorRef  } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { GlobalService } from '../service/global.service';
import {TranslateService} from '@ngx-translate/core';

declare var $:any;
declare var swal:any;

@Component({
  selector: 'transactions-cmp',
  templateUrl: './transactions.component.html'
})


export class TransactionsComponent implements OnInit  {


	public transactionsTable;
    private walletChangeSubscription: ISubscription;
	private timeChangeSubscription: ISubscription;
	private skipFirstInit: boolean = true;

	constructor(private translate: TranslateService,private globalService:GlobalService, private cdr: ChangeDetectorRef) 
	{
	   this.transactionsTable = [];
	   //this.initContinue(); 		
	}
	
	
	 timeConverter(UNIX_timestamp){
	  var a = new Date(UNIX_timestamp * 1000);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	  return time;
	}
	

	async initContinue()
	{
		
		if ($.fn.DataTable.isDataTable("#example")) 
		{
		  $('#example').DataTable().clear().destroy();
		}		  
		
		
		let transactionArray = await this.globalService.getTransactions();
		
		
		for(let d = transactionArray.length-1; d >= 0;d--)
		{
	
			var formattedTime =this.timeConverter(transactionArray[d].time);
			
			let newEntry = {"time" : formattedTime, "address": transactionArray[d].address, "name" : transactionArray[d].label, "category" : transactionArray[d].category, "amount" : transactionArray[d].amount, "confirmations" : transactionArray[d].confirmations };	
			this.transactionsTable.push(newEntry);

		}    
		

		
	    let _that = this;
	    setTimeout(function () {
		  $(function () {
				 $('#example').DataTable
					   (
							 {
								"paging":   true,
								"ordering": false,
								"info":     false,
								"searching" : false,
								"lengthChange" : false
							 }
					   );
					   
					   _that.cdr.detectChanges();
					   _that.skipFirstInit = false;
		  });
		}, 100);
	
		
	}	

    ngOnInit()
	{ 
	

	   this.walletChangeSubscription = this.globalService.walletChanged$.subscribe
	   (
		value => {
			
		this.transactionsTable = [];
		this.initContinue(); 
	   });
	   
	   
	   this.timeChangeSubscription = this.globalService.tMedianTimeChanged$.subscribe
	   (
		value => {
		
		if(this.skipFirstInit == false)
		{
		  this.transactionsTable = [];
		  this.initContinue(); 
		}
	   });	   
	   

    }
	
	
    ngOnDestroy()
	{
	 this.walletChangeSubscription.unsubscribe();
	 this.timeChangeSubscription.unsubscribe();
	}		
	
}
