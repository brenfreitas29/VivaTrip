import type { PretripKey } from "@/types/pretrip";
export const PRETRIP_CATALOG: Array<{key:PretripKey; title:string; description:string}> = [
  {key:"documents",title:"Documentação",description:"Confirme passaporte, requisitos de entrada e documentos aplicáveis ao seu perfil em fontes oficiais."},
  {key:"apps",title:"Apps essenciais",description:"Separe mapas, transporte, pagamentos e comunicação adequados ao destino."},
  {key:"connectivity",title:"Internet & eSIM",description:"Planeje como terá conexão no destino e mantenha informações importantes offline."},
  {key:"money",title:"Dinheiro",description:"Defina moeda, meios de pagamento e uma alternativa de emergência."},
  {key:"transport",title:"Transporte",description:"Organize chegada, deslocamentos principais e referências da hospedagem."},
  {key:"packing",title:"Clima & mala",description:"Revise a estação aproximada e ajuste sua bagagem perto da data."},
  {key:"insurance",title:"Seguro",description:"Compare cobertura e condições aplicáveis à viagem antes de contratar."},
  {key:"emergency",title:"Contatos & reservas",description:"Guarde reservas, contatos úteis, endereço da hospedagem e cópias de documentos."},
];
