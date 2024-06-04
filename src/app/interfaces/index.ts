import { HttpHeaders } from "@angular/common/http";

export interface APIResponse {
    headers: any;
    status:      string;
    message:     string;
    result:      Result;
    result_AREA: string;
    // headers: HttpHeaders
}

export interface Result {
    id:                          string;
    nombre:                      string;
    rol:                         string;
    email:                       string;
    departamento:                string;
    pin_jefe:                    string;
    ver_anticipo:                string;
    pin_empleado:                string;
    tipoTick:                    string;
    ver_incidencias?:            number;
    ver_pagos_anticipos?:        number;
    ver_pagos_solicitud_gastos?: number;
    ver_pagos_incidencias?:      number;
}

export interface UserData {
    logged_in_user_iduser?:          string;
    logged_in_user_name?:            string;
    logged_in_NoAnticipos?:          string;
    logged_in_user_user?:            string;
    logged_in_user_rol?:             string;
    logged_in_user_dep?:             string;
    logged_in_user_area?:            string;
    logged_in_user_pin?:             string;
    logged_in_user_pin_trabajador?:  string;
    logged_in_user_incidencias?:     number;
    token?: string;
}

export interface AuthRequestConfig{
    url: string;
    requestBody: any;
    headers: HttpHeaders;
    httpOptions: any;
}
export interface HistoricoAuth {
    status: string;
    result: {
        id: string;
        origen_tipo: string;
        fecha_creacion: string;
        terminal: string;
        folio: string;
        empleado: string;
        cliente: string;
        concepto: string;
        monto: string;
        area: string;
        nombre_autorizo: string;
        status: string;
        fecha_auth: string;
        statusPagos: string;
        pin_jefe: string | null;
        nombre_autorizo_pago: string;
        fecha_autorizo_pago: string;
        requiere_auth_diesel: string | null;
        requiere_auth_gratificacion: string | null;
        autoriza_diesel: string | null;
        autoriza_grat: string | null;
        requiere_auth_jefe: string | null;
        autoriza_jefe: string | null;
        cuenta_banc: string | null;
        POLIZA_CB: string | null;
        POLIZA_CXP: string | null;
    }[];
}
export interface TokenExpirationResponse {
    expired: boolean;
    error?: string;
}

export interface ResultTerminal {
    status: string;
    result: {
        nom_terminal: string;
    }
}

// export enum Concepto {
//     Casetas = "CASETAS",
//     EquipoDeSeguridad = "EQUIPO DE SEGURIDAD",
//     Fitosanitaria = "FITOSANITARIA",
//     GastosDeTransportacion = "GASTOS DE TRANSPORTACION",
//     Guías = "GUÍAS",
//     Hotel = "HOTEL",
//     Maniobras = "MANIOBRAS",
//     Pensión = "PENSIÓN",
// }

// export enum NomCliente {
//     ColgatePalmolive = "COLGATE PALMOLIVE",
//     DistribuidoraLiverpool = "DISTRIBUIDORA LIVERPOOL",
//     EmbotelladoraNiagaraDeMexico = "EMBOTELLADORA NIAGARA DE MEXICO",
//     HenkelCapital = "HENKEL CAPITAL",
//     KimberlyClarkDeMexico = "KIMBERLY CLARK DE MEXICO",
//     SamsungSdsMexico = "SAMSUNG SDS MEXICO",
//     SanbornHermanos = "SANBORN HERMANOS",
//     SearsOperadoraMexico = "SEARS OPERADORA MEXICO",
//     StellantisMexico = "STELLANTIS MEXICO",
//     TiendasChedraui = "TIENDAS CHEDRAUI",
// }

// export enum NomTerminal {
//     Che = "CHE",
//     Liv = "LIV",
//     Oms = "OMS",
//     Pue = "PUE",
//     Sjic = "SJIC",
// }



