import { Knex } from "knex";
import { AdapterConstructor, AdapterPayload } from "oidc-provider";

const oidc_payloads = "oidc_payloads";

type OIDCType = {
	[key: string]: number;
};

const types: OIDCType = [
	"Session",
	"AccessToken",
	"AuthorizationCode",
	"RefreshToken",
	"DeviceCode",
	"ClientCredentials",
	"Client",
	"InitialAccessToken",
	"RegistrationAccessToken",
	"Interaction",
	"ReplayDetection",
	"PushedAuthorizationRequest",
	"Grant",
].reduce((map, name, i) => ({ ...map, [name]: i + 1 }), {});

export default function (client: Knex): AdapterConstructor {
	return class DbAdapter {
		name: string;
		type: number;
		cleaned: Promise<this>;
		constructor(name: string) {
			this.name = name;
			this.type = types[name];
			this.cleaned = client
				.table(oidc_payloads)
				.where("expiresAt", "<", new Date())
				.delete()
				.then(() => this);
		}

		async upsert(
			id: string,
			payload: AdapterPayload,
			expiresIn: number
		): Promise<undefined | void> {
			const expiresAt = expiresIn
				? new Date(Date.now() + expiresIn * 1000)
				: undefined;
			await client
				.table(oidc_payloads)
				.insert({
					id,
					type: this.type,
					payload: JSON.stringify(payload),
					grantId: payload.grantId,
					userCode: payload.userCode,
					uid: payload.uid,
					expiresAt,
				})
				.onConflict(["id", "type"])
				.merge();
		}

		get _table() {
			return client.table(oidc_payloads).where("type", this.type);
		}

		_rows(obj: any) {
			return this._table.where(obj);
		}

		_result(r: any) {
			return r.length > 0
				? {
						...JSON.parse(r[0].payload),
						...(r[0].consumedAt ? { consumed: true } : undefined),
				  }
				: undefined;
		}

		_findBy(obj: any) {
			return this._rows(obj).then(this._result);
		}

		find(id: string): Promise<AdapterPayload | undefined | void> {
			return this._findBy({ id });
		}

		findByUserCode(
			userCode: string
		): Promise<AdapterPayload | undefined | void> {
			return this._findBy({ userCode });
		}

		findByUid(uid: string): Promise<AdapterPayload | undefined | void> {
			return this._findBy({ uid });
		}

		destroy(id: string): Promise<undefined | void> {
			return this._rows({ id }).delete();
		}

		revokeByGrantId(grantId: string): Promise<undefined | void> {
			return this._rows({ grantId }).delete();
		}

		consume(id: string): Promise<undefined | void> {
			return this._rows({ id }).update({ consumedAt: new Date() });
		}
	};
}
