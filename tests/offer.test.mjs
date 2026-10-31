import test from 'node:test';
import assert from 'node:assert/strict';
import {hundredths,lineCents,totals,costBreakdown,missingOfferFields,createOffer,saveOffer,loadOffer,archiveOffer} from '../src/data/offer.ts';
const project={id:'REN-001',scopeDe:'Musterumfang'};
const line=(quantity,price)=>({id:'1',description:'Arbeit',unit:'Std.',quantity,price});
test('German decimals, cents rounding per line and VAT on rounded net',()=>{
 assert.equal(hundredths('19,99'),1999);assert.equal(hundredths('19.99'),1999);
 assert.equal(lineCents(line('2,50','19,99')),4998);
 const o={lines:[line('2,50','19,99'),line('1','100')],tax:'standard'};
 assert.deepEqual(totals(o),{net:14998,vat:2850,gross:17848,complete:true});
 assert.deepEqual(totals({...o,tax:'small'}),{net:14998,vat:0,gross:14998,complete:true});
});
test('Explicit mock estimates, no assumed VAT; invalid input cannot yield final total',()=>{
 for(const v of ['-1','1e3','1.000,50','NaN','0.001','Infinity','100000000'])assert.equal(hundredths(v),null);
 assert.equal(lineCents(line('0','10')),null);assert.equal(lineCents(line('1','')),null);
 const o=createOffer(project,'Kundenwünsche');assert(o.lines.every(l=>l.estimated && lineCents(l)!==null));
 assert.deepEqual(costBreakdown(o),{material:260000,labor:208000,other:0});
 assert.equal(totals({...o,tax:'standard'}).gross,556920);
 assert.equal(totals(o).complete,false);assert(missingOfferFields(o).length>0);
 assert.equal(totals({lines:[line('1','20')],tax:''}).complete,false);
});
test('Project storage isolation, immutable export history and malformed data retained',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 const o=createOffer(project,'Kontext');saveOffer(o);assert.equal(loadOffer('REN-002'),null);
 assert.equal(archiveOffer(o),1);o.scope='Änderung';assert.equal(archiveOffer(o),2);
 const history=JSON.parse(memory.get('renovaite.offer.REN-001.v1.exports'));
 assert.equal(history[0].offer.scope,'Musterumfang');assert.equal(history[1].offer.scope,'Änderung');
 memory.set('renovaite.offer.REN-001.v1','{"projectId":"REN-001","scope":"x","lines":[]}');
 assert.throws(()=>loadOffer('REN-001'));assert(memory.get('renovaite.offer.REN-001.v1').includes('"scope":"x"'));
});

test('Applying mock prices never overwrites existing entered values',async()=>{
 const {applyCostEstimate}=await import('../src/data/costEstimate.ts');
 const o=createOffer(project,'');o.lines[0].price='999';
 assert.strictEqual(applyCostEstimate(o),o);
 const blank={...o,lines:[line('','')]};
 const estimated=applyCostEstimate(blank);
 assert(estimated.lines.every(l=>l.estimated));assert.equal(estimated.reviewed,false);
});
