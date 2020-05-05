import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-facets',
  templateUrl: './facets.component.html'
})
export class FacetsComponent implements OnInit {

  @Output() onChange: EventEmitter<{name: string, value: string}[]> = new EventEmitter();

  @Input() set aggregations(json: any) {

    if (!json) {
      this.buckets = [];
      return;
    }
    /*console.log("in:");
    console.log(json);

    console.log("old:");
    console.log(this.buckets);*/
    const newBuckets = [];
    for (const propName in  json) {
      if (json[propName].buckets.length > 0) {
        const oldBucket = this.buckets.filter((b) => b.name === propName);
        newBuckets.push({
          name: propName,
          data: json[propName].buckets,
          selectedValue: oldBucket.length > 0 ? oldBucket[0]['selectedValue'] : null
        })
      }
    }

    this.buckets = newBuckets;
    // console.log("rendered:");
    // console.log(this.buckets);
  }

  private buckets: {name: string, selectedValue?: string, data: {key: string, doc_count: number}[] }[] = [];

  constructor(private elRef: ElementRef) { }

  ngOnInit() {

  }

  public change(bucketName: string, value): void {
    const selects = this.elRef.nativeElement.querySelectorAll('select');
    const values = [];

    for (let i = 0; i < this.buckets.length; i++) {
      if (this.buckets[i].name === bucketName) {
        if (value && value !== '') {
          this.buckets[i].selectedValue = value;
        } else {
          this.buckets[i].selectedValue = null;
        }
      }
      if (this.buckets[i].selectedValue && this.buckets[i].selectedValue !== '') {
        values.push({name: this.buckets[i].name, value: this.buckets[i].selectedValue});
      }
    }
console.log(values)
    this.onChange.emit(values);

  }

}
