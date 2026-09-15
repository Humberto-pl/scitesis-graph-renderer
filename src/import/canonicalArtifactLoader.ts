import Ajv2020, { type ErrorObject } from 'ajv/dist/2020';
import outputSchema from '../../docs/canonical-simulator/SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_SCHEMA_v0.3.json';
import type { ConfirmedSimulatedGraphArtifact } from '../graph/types';
export type ArtifactLoadError={code:'INVALID_JSON'|'UNSUPPORTED_ARTIFACT_TYPE'|'SCHEMA_VALIDATION_FAILED';message:string;details?:string[]};
export type ArtifactLoadResult={ok:true;artifact:ConfirmedSimulatedGraphArtifact}|{ok:false;error:ArtifactLoadError};
const ajv = new Ajv2020({ allErrors: true, useDefaults: false, removeAdditional: false, coerceTypes: false });
ajv.addKeyword({ keyword: 'x-status', schemaType: 'string', valid: true });
const validate = ajv.compile(outputSchema);
const validationDetail = (error: ErrorObject): string => `${error.instancePath || ('dataPath' in error ? String(error.dataPath) : '') || '/'}: ${error.message ?? error.keyword}`;
export function loadCanonicalArtifactFromText(text:string):ArtifactLoadResult{let parsed:unknown;try{parsed=JSON.parse(text)}catch(error){return{ok:false,error:{code:'INVALID_JSON',message:'El archivo no contiene JSON válido.',details:[error instanceof Error?error.message:'JSON parse failed']}}}if(typeof parsed==='object'&&parsed!==null&&'artifact_type'in parsed&&(parsed as {artifact_type?:unknown}).artifact_type!=='CONFIRMED_SIMULATED_GRAPH')return{ok:false,error:{code:'UNSUPPORTED_ARTIFACT_TYPE',message:'Este renderer espera un CONFIRMED_SIMULATED_GRAPH.',details:[`Tipo recibido: ${String((parsed as {artifact_type?:unknown}).artifact_type)}`]}};if(!validate(parsed))return{ok:false,error:{code:'SCHEMA_VALIDATION_FAILED',message:'Artifact inválido según Output Schema v0.3.',details:(validate.errors??[]).slice(0,15).map(validationDetail)}};return{ok:true,artifact:parsed as ConfirmedSimulatedGraphArtifact}}
