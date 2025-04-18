import characters from '$lib/data/characters.json';
import { HistoryManager } from '$lib/helpers/dataAPI/api-indexeddb';

async function CompDMG(){

    let charDPS = [...characters.data].filter(char => char.rarity == 5 && char.class == "dps");
    let charSPT = [...characters.data].filter(char => char.rarity == 5 && char.class == "spt");

    let inv = [];
    let cons = [];
    let consINV = [];
    
    inv = await HistoryManager.getAllHistories()
    
    for (let cop of inv) {
        if (cop.rarity == 5){
            let key = cop.name;
            cons[key] = (cons[key] || 0) + 1;
        }
    }

    consINV = Object.entries(cons).map(([name, count]) => ({ name, count }));

    let boom = 0; //total damage
    let mulSPT = 1; //support multipliers

    for (let peep of consINV){
        for (let char of charDPS){

            if (char.name == peep.name){
                let charDMG = char.b_dmg;
        
                if (peep.count == 5){
                    charDMG = char.c4_dmg;} //c4 multiplier
                            
                if(peep.count >= 7){
                    charDMG = char.c6_dmg} //c6 multiplier
                
                boom = boom + charDMG;
            
            }            
        }

        for (let char of charSPT){
            let charDMG = char.b_dmg;

            if (char.name == peep.name){
                boom = boom + charDMG;
        
            if (mulSPT == 1){
                mulSPT = char.b_mult;}
            else{
                mulSPT = mulSPT + char.b_mult;}
        
            if (peep.count >= 5){
                mulSPT = mulSPT + char.c4_mult;}
        
            if (peep.count >= 7){
                mulSPT = mulSPT + char.c6_mult;}
        
            } 
        }
    }

    boom = boom * mulSPT;

    return boom;
}


export default async function DieBar(){
    let boom;

    boom = await CompDMG();

    return boom;
}