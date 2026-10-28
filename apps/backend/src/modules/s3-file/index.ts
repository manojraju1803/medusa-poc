import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import S3FileProviderService from './service';

export default ModuleProvider(Modules.FILE, {
  services: [S3FileProviderService],
});
