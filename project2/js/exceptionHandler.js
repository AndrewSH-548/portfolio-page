//Certain mons have alternate forms to take into account
//This function will handle any significant ones
//Due to this function's sheer length, it is in a separate page.
function handleAltForms(monName) {
    let suffixArray;
    //Fill the array of suffixes based on the mon.
    if (monName.toLowerCase() == "castform") {
        suffixArray = [
            "",
            "-sunny",
            "-rainy",
            "-snowy"
        ]
    }
    if (monName.toLowerCase() == "kyogre" || monName.toLowerCase() == "groudon") {
        suffixArray = [
            "",
            "-primal"
        ]
    }
    else if (monName.toLowerCase() == "deoxys") {
        suffixArray = [
            "-normal",
            "-attack",
            "-defense",
            "-speed"
        ]
    }
    else if (monName.toLowerCase() == "wormadam") {
        suffixArray = [
            "-plant",
            "-sandy",
            "-trash"
        ]
    }
    else if (monName.toLowerCase() == "rotom") {
        suffixArray = [
            "",
            "-heat",
            "-wash",
            "-mow",
            "-frost",
            "-fan"
        ]
    }
    else if (monName.toLowerCase() == "giratina") {
        suffixArray = [
            "-altered",
            "-origin"
        ]
    }
    else if (monName.toLowerCase() == "shaymin") {
        suffixArray = [
            "-land",
            "-sky"
        ]
    }
    else if (monName.toLowerCase() == "basculin") {
        suffixArray = [
            "-red-striped",
            "-blue-striped",
            "-white-striped"
        ]
    }
    else if (monName.toLowerCase() == "darmanitan") {
        suffixArray = [
            "-standard",
            "-zen",
            "-galar-standard",
            "-galar-zen"
        ]
    }
    else if (monName.toLowerCase() == "tornadus" || monName.toLowerCase() == "thundurus" || monName.toLowerCase() == "landorus" || monName.toLowerCase() == "enamorus") {
        suffixArray = [
            "-incarnate",
            "-therian"
        ]
    }
    else if (monName.toLowerCase() == "kyurem") {
        suffixArray = [
            "",
            "-black",
            "-white"
        ]
    }
    else if (monName.toLowerCase() == "keldeo") {
        suffixArray = [
            "-ordinary",
            "-resolute"
        ]
    }
    else if (monName.toLowerCase() == "meloetta") {
        suffixArray = [
            "-aria",
            "-pirouette"
        ]
    }
    else if (monName.toLowerCase() == "venusaur" || monName.toLowerCase() == "blastoise" || monName.toLowerCase() == "beedrill" || monName.toLowerCase() == "pidgeot" || monName.toLowerCase() == "slowbro" || monName.toLowerCase() == "alakazam" || monName.toLowerCase() == "gengar" || monName.toLowerCase() == "kangaskhan" || monName.toLowerCase() == "pinsir" || monName.toLowerCase() == "gyarados" || monName.toLowerCase() == "aerodactyl" || monName.toLowerCase() == "ampharos" || monName.toLowerCase() == "steelix" || monName.toLowerCase() == "scizor" || monName.toLowerCase() == "heracross" || monName.toLowerCase() == "houndoom" || monName.toLowerCase() == "tyranitar" || monName.toLowerCase() == "sceptile" || monName.toLowerCase() == "blaziken" || monName.toLowerCase() == "swampert" || monName.toLowerCase() == "gardevoir" || monName.toLowerCase() == "sableye" || monName.toLowerCase() == "mawile" || monName.toLowerCase() == "aggron" || monName.toLowerCase() == "medicham" || monName.toLowerCase() == "manectric" || monName.toLowerCase() == "sharpedo" || monName.toLowerCase() == "camerupt" || monName.toLowerCase() == "altaria" || monName.toLowerCase() == "banette" || monName.toLowerCase() == "absol" || monName.toLowerCase() == "glalie" || monName.toLowerCase() == "salamence" || monName.toLowerCase() == "metagross" || monName.toLowerCase() == "latias" || monName.toLowerCase() == "latios" || monName.toLowerCase() == "rayquaza" || monName.toLowerCase() == "lopunny" || monName.toLowerCase() == "garchomp" || monName.toLowerCase() == "lucario" || monName.toLowerCase() == "abomasnow" || monName.toLowerCase() == "gallade" || monName.toLowerCase() == "audino" || monName.toLowerCase() == "diancie") {
        suffixArray = [
            "",
            "-mega"
        ]
    }
    else if (monName.toLowerCase() == "charizard" || monName.toLowerCase() == "mewtwo") {
        suffixArray = [
            "",
            "-mega-x",
            "-mega-y"
        ]
    }
    else if (monName.toLowerCase() == "greninja") {
        suffixArray = [
            "",
            "-ash"
        ]
    }
    else if (monName.toLowerCase() == "floette") {
        suffixArray = [
            "",
            "-eternal"
        ]
    }
    else if (monName.toLowerCase() == "meowstic" || monName.toLowerCase() == "indeedee" || monName.toLowerCase() == "basculegion") {
        suffixArray = [
            "-male",
            "-female"
        ]
    }
    else if (monName.toLowerCase() == "aegislash") {
        suffixArray = [
            "-shield",
            "-blade"
        ]
    }
    else if (monName.toLowerCase() == "pumpkaboo" || monName.toLowerCase() == "gourgeist") {
        suffixArray = [
            "-small",
            "-average",
            "-large",
            "-super"
        ]
    }
    else if (monName.toLowerCase() == "wormadam") {
        suffixArray = [
            "-10",
            "-50",
            "-complete"
        ]
    }
    else if (monName.toLowerCase() == "hoopa") {
        suffixArray = [
            "",
            "-unbound"
        ]
    }
    else if (monName.toLowerCase() == "rattata" || monName.toLowerCase() == "raticate" || monName.toLowerCase() == "raichu" || monName.toLowerCase() == "sandshrew" || monName.toLowerCase() == "sandslash" || monName.toLowerCase() == "vulpix" || monName.toLowerCase() == "ninetales" || monName.toLowerCase() == "diglett" || monName.toLowerCase() == "dugtrio" || monName.toLowerCase() == "persian" || monName.toLowerCase() == "geodude" || monName.toLowerCase() == "graveler" || monName.toLowerCase() == "golem" || monName.toLowerCase() == "grimer" || monName.toLowerCase() == "muk" || monName.toLowerCase() == "marowak" || monName.toLowerCase() == "exeggutor") {
        suffixArray = [
            "",
            "-alola"
        ]
    }
    else if (monName.toLowerCase() == "meowth") {
        suffixArray = [
            "",
            "-alola",
            "-galar"
        ]
    }
    else if (monName.toLowerCase() == "oricorio") {
        suffixArray = [
            "-baile",
            "-pau",
            "-sensu",
            "-pom-pom"
        ]
    }
    else if (monName.toLowerCase() == "lycanroc") {
        suffixArray = [
            "-midday",
            "-midnight",
            "-dusk"
        ]
    }
    else if (monName.toLowerCase() == "wishiwashi") {
        suffixArray = [
            "-solo",
            "-school"
        ]
    }
    else if (monName.toLowerCase() == "mimikyu") {
        suffixArray = [
            "-disguised",
            "-busted"
        ]
    }
    else if (monName.toLowerCase() == "minior") {
        suffixArray = [
            "-red",
            "-orange",
            "-yellow",
            "-green",
            "-blue",
            "-indigo",
            "-violet"
        ]
    }
    else if (monName.toLowerCase() == "necrozma") {
        suffixArray = [
            "",
            "-dusk",
            "-dawn",
            "-ultra"
        ]
    }
    else if (monName.toLowerCase() == "ponyta" || monName.toLowerCase() == "rapidash" || monName.toLowerCase() == "slowpoke" || monName.toLowerCase() == "slowbro" || monName.toLowerCase() == "farfetchd" || monName.toLowerCase() == "weezing" || monName.toLowerCase() == "mr-mime" || monName.toLowerCase() == "articuno" || monName.toLowerCase() == "zapdos" || monName.toLowerCase() == "moltres" || monName.toLowerCase() == "slowking" || monName.toLowerCase() == "corsola" || monName.toLowerCase() == "zigzagoon" || monName.toLowerCase() == "linoone" || monName.toLowerCase() == "yamask" || monName.toLowerCase() == "stunfisk") {
        suffixArray = [
            "",
            "-galar"
        ]
    }
    else if (monName.toLowerCase() == "toxtricity") {
        suffixArray = [
            "-amped",
            "-low-key"
        ]
    }
    else if (monName.toLowerCase() == "eiscue") {
        suffixArray = [
            "-ice",
            "-noice"
        ]
    }
    else if (monName.toLowerCase() == "morpeko") {
        suffixArray = [
            "-full-belly",
            "-hangry"
        ]
    }
    else if (monName.toLowerCase() == "zacian" || monName.toLowerCase() == "zamazenta") {
        suffixArray = [
            "",
            "-crowned"
        ]
    }
    else if (monName.toLowerCase() == "urshifu") {
        suffixArray = [
            "-single-strike",
            "-rapid-strike"
        ]
    }
    else if (monName.toLowerCase() == "calyrex") {
        suffixArray = [
            "",
            "-ice",
            "-shadow"
        ]
    }
    else if (monName.toLowerCase() == "growlithe" || monName.toLowerCase() == "arcanine" || monName.toLowerCase() == "voltorb" || monName.toLowerCase() == "electrode" || monName.toLowerCase() == "typhlosion" || monName.toLowerCase() == "qwilfish" || monName.toLowerCase() == "sneasel" || monName.toLowerCase() == "samurott" || monName.toLowerCase() == "lilligant" || monName.toLowerCase() == "zorua" || monName.toLowerCase() == "zoroark" || monName.toLowerCase() == "braviary" || monName.toLowerCase() == "sliggoo" || monName.toLowerCase() == "goodra" || monName.toLowerCase() == "avalugg" || monName.toLowerCase() == "decidueye") {
        suffixArray = [
            "",
            "-hisui"
        ]
    }
    else if (monName.toLowerCase() == "tauros") {
        suffixArray = [
            "",
            "-paldea-combat-breed",
            "-paldea-blaze-breed",
            "-paldea-aqua-breed"
        ]
    }
    else if (monName.toLowerCase() == "wooper") {
        suffixArray = [
            "",
            "-paldea",
        ]
    }
    else if (monName.toLowerCase() == "oinkologne") {
        suffixArray = [
            "",
            "-female"
        ]
    }
    else if (monName.toLowerCase() == "palafin") {
        suffixArray = [
            "",
            "-hero"
        ]
    }
    else if (monName.toLowerCase() == "ogerpon") {
        suffixArray = [
            "",
            "-wellspring-mask",
            "-hearthflame-mask",
            "-cornerstone-mask"
        ]
    }
    else {
        //Return the intact name if it's not part of the exceptions.
        return monName;
    }

    //Randomly choose from the array of suffixes to append to the mon's name
    return monName + suffixArray[Math.floor(Math.random() * suffixArray.length)];
}

//Returns the generation this mon is native to based on the ID, which is the national Pokedex number.
function generationParse(id) {
    if (id <= 151) {
        return 1;
    }
    else if (id > 151 && id <= 251) {
        return 2;
    }
    else if (id > 251 && id <= 386) {
        return 3;
    }
    else if (id > 386 && id <= 493) {
        return 4;
    }
    else if (id > 493 && id <= 649) {
        return 5;
    }
    else if (id > 649 && id <= 721) {
        return 6;
    }
    else if (id > 721 && id <= 809) {
        return 7;
    }
    else if (id > 809 && id <= 905) {
        return 8;
    }
    else if (id > 10000) {
        //Alt forms have IDs over 10000
        return handleGenExceptions(id);
    }
    else {
        //Gen 9 is the current highest generation.
        return 9;
    }
}

//Alt forms have IDs above 10000
//Return their gen number on a case-by-case basis.
function handleGenExceptions(id) {
    switch (id - 10000) {
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
        case 41:
        case 42:
        case 43:
        case 44:
        case 71:
        case 73:
        case 90:
            return 1;
        case 45:
        case 46:
        case 47:
        case 48:
        case 49:
        case 72:
            return 2;
        case 1:
        case 2:
        case 3:
        case 13:
        case 14:
        case 15:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
        case 62:
        case 63:
        case 64:
        case 65:
        case 66:
        case 67:
        case 70:
        case 74:
        case 76:
        case 77:
        case 78:
        case 87:
        case 89:
            return 3;
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10: 
        case 11:
        case 12:
        case 58:
        case 59:
        case 60:
        case 68:
        case 88:
            return 4;
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 69:
        case 247:
            return 5;
        case 25:
        case 26:
        case 27:
        case 28:
        case 29:
        case 30:
        case 31:
        case 32:
        case 61:
        case 75:
        case 86:
        case 120:
        case 181:
            return 6;
        case 91:
        case 92:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 123:
        case 124:
        case 125:
        case 126:
        case 127:
        case 136:
        case 137:
        case 138:
        case 139:
        case 140:
        case 141:
        case 142:
        case 143:
        case 152:
        case 155:
        case 156:
        case 157:
            return 7;
        case 161:
        case 162:
        case 163:
        case 164:
        case 165:
        case 166:
        case 167:
        case 168:
        case 169:
        case 170:
        case 171:
        case 172:
        case 173:
        case 174:
        case 175:
        case 176:
        case 177:
        case 178:
        case 179:
        case 180:
        case 184:
        case 185:
        case 186:
        case 187:
        case 188:
        case 189:
        case 191:
        case 193:
        case 194:
        case 229:
        case 230:
        case 231:
        case 232:
        case 233:
        case 234:
        case 235:
        case 236:
        case 237:
        case 238:
        case 239:
        case 240:
        case 241:
        case 242:
        case 243:
        case 244:
        case 248:
        case 249:
            return 8;
        case 250:
        case 251:
        case 252:
        case 253:
        case 254:
        case 272:
        case 273:
        case 274:
        case 275:
            return 9;
    }
}

//There's a small set of mons that need to be checked for name formatting purpose.
//These are mons with hyphens in their names
function specialCaseCheck(id) {
    return id == 250 || id == 474 || (id >= 782 && id <= 784) || (id >= 1001 && id <= 1004) || id > 10000
}