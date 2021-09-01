import { Template } from '../template';
interface ProjectArgs {
    name: string;
    author: string;
}
export declare const composePackageJson: (template: Template) => ({ name, author }: ProjectArgs) => {
    name: string;
    author: string;
    'size-limit': {
        path: string;
        limit: string;
    }[];
    version?: string;
    description?: string;
    keywords?: string[];
    homepage?: import("type-fest").LiteralUnion<".", string>;
    bugs?: import("type-fest").PackageJson.BugsLocation;
    license?: string;
    licenses?: {
        type?: string;
        url?: string;
    }[];
    contributors?: import("type-fest").PackageJson.Person[];
    maintainers?: import("type-fest").PackageJson.Person[];
    files?: string[];
    type?: "module" | "commonjs";
    main?: string;
    exports?: import("type-fest").PackageJson.Exports;
    bin?: string | Record<string, string>;
    man?: string | string[];
    directories?: import("type-fest").PackageJson.DirectoryLocations;
    repository?: string | {
        type: string;
        url: string;
        directory?: string;
    };
    scripts?: import("type-fest").PackageJson.Scripts;
    config?: Record<string, unknown>;
    dependencies?: import("type-fest").PackageJson.Dependency;
    devDependencies?: import("type-fest").PackageJson.Dependency;
    optionalDependencies?: import("type-fest").PackageJson.Dependency;
    peerDependencies?: import("type-fest").PackageJson.Dependency;
    peerDependenciesMeta?: Record<string, {
        optional: true;
    }>;
    bundledDependencies?: string[];
    bundleDependencies?: string[];
    engines?: {
        [x: string]: string;
    };
    engineStrict?: boolean;
    os?: import("type-fest").LiteralUnion<"aix" | "darwin" | "freebsd" | "linux" | "openbsd" | "sunos" | "win32" | "!aix" | "!darwin" | "!freebsd" | "!linux" | "!openbsd" | "!sunos" | "!win32", string>[];
    cpu?: import("type-fest").LiteralUnion<"arm" | "arm64" | "ia32" | "mips" | "mipsel" | "ppc" | "ppc64" | "s390" | "s390x" | "x32" | "x64" | "!arm" | "!arm64" | "!ia32" | "!mips" | "!mipsel" | "!ppc" | "!ppc64" | "!s390" | "!s390x" | "!x32" | "!x64", string>[];
    preferGlobal?: boolean;
    private?: boolean;
    publishConfig?: Record<string, unknown>;
    funding?: string | {
        type?: import("type-fest").LiteralUnion<"github" | "opencollective" | "patreon" | "individual" | "foundation" | "corporation", string>;
        url: string;
    };
    module?: string;
    esnext?: string | {
        [moduleName: string]: string;
        main?: string;
        browser?: string;
    };
    browser?: string | Record<string, string | false>;
    sideEffects?: boolean | string[];
    types?: string;
    typings?: string;
    workspaces?: string[] | import("type-fest").PackageJson.WorkspaceConfig;
    flat?: boolean;
    resolutions?: import("type-fest").PackageJson.Dependency;
    jspm?: import("type-fest").PackageJson;
    husky: any;
    prettier: any;
};
export {};
