import { Container, ContainerDomain, ContainerStatus, Namespace, Privacy } from '../types'

const productionNamespace: Namespace = {
  id: '4a1a9390-7f17-44ea-9416-b9c35624b53f',
  name: 'production',
  region: 'fr-par',
  description: 'Production namespace',
  status: ContainerStatus.READY,
}

const betaNamespace: Namespace = {
  id: 'd6f768da-f669-498a-a218-78c1a8b2f02a',
  name: 'beta',
  region: 'fr-par',
  description: 'Beta namespace for testing',
  status: ContainerStatus.READY,
}

export const fakeNamespaces: Namespace[] = [productionNamespace, betaNamespace]

const websiteContainer: Container = {
  id: '9c917bec-c020-468b-8a17-3a3cdff64823',
  name: 'website',
  namespace_id: productionNamespace.id,
  status: ContainerStatus.READY,
  min_scale: 1,
  max_scale: 5,
  memory_limit: 1024,
  cpu_limit: 560,
  timeout: '300s',
  error_message: null,
  privacy: Privacy.PUBLIC,
  description: 'Website container for the company',
  registry_image: 'rg.fr-par.scw.cloud/company/website:latest',
  max_concurrency: 80,
  domain_name: 'website.functions.fnc.fr-par.scw.cloud',
  protocol: 'unknown_protocol',
  port: 8080,
  region: 'fr-par',
}
const documentationContainer: Container = {
  id: 'c9c0091e-cb5b-44ac-bc9f-8b5d2e3001df',
  name: 'documentation',
  namespace_id: productionNamespace.id,
  status: ContainerStatus.READY,
  min_scale: 1,
  max_scale: 2,
  memory_limit: 512,
  cpu_limit: 280,
  timeout: '600s',
  error_message: null,
  privacy: Privacy.PUBLIC,
  description: 'Application documentation',
  registry_image: 'rg.fr-par.scw.cloud/company/documentation:latest',
  max_concurrency: 80,
  domain_name: 'documentation.functions.fnc.fr-par.scw.cloud',
  protocol: 'unknown_protocol',
  port: 8080,
  region: 'fr-par',
}

const apiContainer: Container = {
  id: '1b16216a-81a5-4b85-b7fc-52842729c5c3',
  name: 'api',
  namespace_id: betaNamespace.id,
  status: ContainerStatus.ERROR,
  min_scale: 1,
  max_scale: 1,
  memory_limit: 512,
  cpu_limit: 280,
  timeout: '300s',
  error_message: "Error: Cannot find module '@company/types'",
  privacy: Privacy.PUBLIC,
  description: 'Beta API container',
  registry_image: 'rg.fr-par.scw.cloud/company/api:latest',
  max_concurrency: 80,
  domain_name: 'api.functions.fnc.fr-par.scw.cloud',
  protocol: 'unknown_protocol',
  port: 8080,
  region: 'fr-par',
}

export const fakeContainers: Container[] = [websiteContainer, documentationContainer, apiContainer]

export const fakeDomains: ContainerDomain[] = [
  {
    id: '2a2c5d0f-c867-42cb-861a-41f87dc2a78c',
    hostname: 'company.com',
    container_id: websiteContainer.id,
    url: 'https://company.com',
  },
  {
    id: '9e8ecdde-29e3-4deb-acad-06eb6b541119',
    hostname: 'docs.company.com',
    container_id: documentationContainer.id,
    url: 'https://docs.company.com',
  },
  {
    id: 'c57a298b-76d3-4f18-875f-dec1a655e3ee',
    hostname: 'api.company.com',
    container_id: apiContainer.id,
    url: 'https://api.company.com',
  },
]
