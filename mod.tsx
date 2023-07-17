import * as React from "https://oliver-makes-code.github.io/ts-cli/fakeReact.tsx"
import * as pk from "npm:pkapi.js@5.1.1"
import { Client } from "https://deno.land/x/discord_rpc@0.3.2/mod.ts"
import fennec from "https://oliver-makes-code.github.io/FennecConfig/impl/typescript/mod.ts"

type PKAPI = pk.default
const PKAPI: typeof pk.default = pk.default

const { getString } = React

async function file_exists(filename: string): Promise<boolean> {
    try {
        await Deno.stat(filename)
        return true
    } catch (err) {
        return false
    }
}

function print(node: React.Node) {
    console.log(getString(node))
}

async function update_presence(client: Client, api: PKAPI) {
    const system = await api.getSystem()
    const fronters = await system.getFronters()
    const timestamp = typeof fronters.timestamp == "string" ? fronters.timestamp : fronters.timestamp.toISOString()
    const fronterlist = fronters.members as Map<string, pk.Member>
    const members: string[] = []
    fronterlist.forEach(member => members.push(member.display_name ?? member.name))
    const display_member = members.length == 0 ? "No fronter" : members[0]
    members.shift()
    await client.setActivity({
        details: display_member,
        state: members.length == 0 ? undefined : members.join(", "),
        timestamps: {
            start: Date.parse(timestamp)
        }
    })
}

const default_config = {
    pk_token: "TOKEN GOES HERE",
    api_url: "https://api.pluralkit.me"
}

if (!await file_exists("config.fennec")) {
    const file = await Deno.create("config.fennec")
    file.write(new TextEncoder().encode(fennec.stringify(default_config, false, 4)))
    print(<>
        <green>File <bold>config.fennec</bold> created</green>
        <br/>
        <blue>Please update <reset>pk_token</reset> before continuing</blue>
    </>)
    Deno.exit(0)
}

const config: typeof default_config = fennec.parse(await Deno.readTextFile("config.fennec"))

const client = new Client({
    id: "956699877453226044"
})

//@ts-ignore grr
const api: PKAPI = new PKAPI({
    base_url: config.api_url,
    token: config.pk_token
})

await client.connect()

print(<blue>Starting..</blue>)

update_presence(client, api)

setInterval(() => update_presence(client, api), 30000)
